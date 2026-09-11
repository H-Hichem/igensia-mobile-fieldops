export type SyncStatus = 'PENDING' | 'SYNCED' | 'ERROR';

// GeoJSON standard (RFC 7946) : coordinates = [longitude, latitude], dans cet
// ordre precis. Correspond a ce que Postgis/Hasura renverront pour une colonne
// GEOGRAPHY(Point).
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// UNIQUEMENT pour Google Maps :
export interface LngLat {
  lat: number;
  lng: number;
}
// UNIQUEMENT pour Capacitor Geolocation :
export interface Position {
  latitude: number;
  longitude: number;
}

// Le schema SQL ne fige que 'created' comme valeur garantie ; les autres sont
// indicatives (commentaires du DDL, non finalisees).
export type SessionStatus = 'created' | 'closed' | 'deleted';
export type ObservationStatus = 'created' | 'deleted'; // + control, en_traitement... plus tard

// Correspond a la table `session` du schema SQL.
export interface Session {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  status: SessionStatus;
  name: string;
  notes: string | null;
  location: GeoJSONPoint | null;
  // formatted_address complet de Google Geocoding, stocke tel quel.
  address_name: string | null;
  // Colonnes structurees existant en base mais pas encore alimentees cote front
  // (parsing des address_components de Google fastidieux et pas toujours fiable) -
  // optionnelles pour ne pas forcer leur presence partout tant qu'elles ne sont
  // pas utilisees.
  address_streetno?: string | null;
  address_complement?: string | null;
  address_city?: string | null;
  address_zipcode?: string | null;
  sync_status: SyncStatus;
}

// Champs modifiables a la creation d'une seance (pas id/owner_id/status/
// sync_status/timestamps, geres cote serveur/Hasura). Partage par les 3
// implementations (mock/rest/graphql) de sessionsApi.
export type SessionInput = Pick<Session, 'name' | 'location' | 'notes' | 'address_name'>;

// observation.category : texte libre en base (pas de table de reference active),
// la valeur stockee EST le libelle affiche - donc pas de mapping slug -> libelle.
export const OBSERVATION_CATEGORIES = [
  // Déchets et pollution :
  'Déchet plastique',
  'Déchet métallique',
  'Déchet verre',
  'Déchet papier/carton',
  'Déchet textile',
  'Déchet électronique',
  'Pile ou batterie abandonnée',
  'Déchet dangereux',
  'Mégot de cigarette',
  'Emballage alimentaire',
  'Encombrant abandonné',
  'Gravats',
  'Dépôt sauvage',
  'Pollution liquide visible',
  'Pollution des eaux',
  'Pollution lumineuse notable',

  // Eau et milieux naturels :
  'Zone humide',
  'Érosion',
  'Mobilier détérioré',
  "Fuite d'eau",
  "Cours d'eau encombré",
  'Dégradation de berge',
  'Assèchement inhabituel',
  "Obstacle à l'écoulement",
  'Eau stagnante inhabituelle',
  'Dégradation de zone humide',
  "Source ou point d'eau",
  'Érosion de sentier',

  // Faune et flore :
  'Espèce invasive',
  'Arbre remarquable',
  'Arbre endommagé',
  'Arbre mort',
  'Arbre dangereux',
  'Plante protégée',
  'Végétation dégradée',
  'Espèce végétale invasive',
  'Habitat naturel remarquable',
  'Nid ou habitat animal',
  'Observation de faune',
  'Passage de faune',
  'Animal blessé ou en difficulté',

  // Équipements et usages :
  'Point de collecte',
  'Composteur collectif',
  "Fontaine ou point d'eau potable",
  "Panneau d'information dégradé",
  'Sentier impraticable',
  'Barrière ou clôture dégradée',
  'Éclairage extérieur excessif',
  'Mobilier urbain dégradé',
  'Installation de recyclage',
  'Zone nécessitant une intervention',
  'Equipement environnemental dégradé',
] as const;

export type ObservationCategory = (typeof OBSERVATION_CATEGORIES)[number];

// Correspond a la table `observation` du schema SQL.
export interface Observation {
  id: string;
  session_id: string; // FK NOT NULL en base
  user_id: string;
  created_at: string; // = Horodatage affiche a l'ecran
  updated_at: string;
  status: ObservationStatus;
  status_changed_at: string;
  location: GeoJSONPoint | null;
  category: ObservationCategory | null;
  nombre: number; // smallint, defaut 1
  poids_g: number | null; // numeric(6,3)
  notes: string | null;
  sync_status: SyncStatus;
  // Absent de la table observation elle-meme (juste user_id) : vient d'une
  // relation/jointure cote API quand elle est disponible.
  user?: { id: string; firstname: string; lastname: string; email: string | null };
  photos?: Photo[];
}

// Champs modifiables par le formulaire (pas id/session_id/user_id/status/
// sync_status/timestamps, geres cote serveur/Hasura). Partage par les 3
// implementations (mock/rest/graphql) de observationsApi.
export type ObservationInput = Pick<
  Observation,
  'category' | 'location' | 'nombre' | 'poids_g' | 'notes' | 'photos'
>;

// Correspond a la table `photo` du schema SQL. Pas encore exploite cote UI -
// juste aligne pour reference (stockage/format encore a trancher).
export interface Photo {
  id: string;
  created_at: string;
  updated_at: string;
  observation_id: string;
  data: string; // bytea -> transitera en base64 cote API/JSON
  mime_type: string;
}
export type PhotoInput = Pick<
  Photo,
  'data' | 'mime_type'
>;

// LATER : table user_session (n-n users <-> sessions), volontairement pas
// encore modelisee ici.
