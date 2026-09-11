// data.tsx
import { User } from "./auth/types";
import { Session, Observation } from "./fieldops/types"; // LATER UserSession ?

// UUID v4 générés aléatoirement pour l'exemple
const userIds = {
  dupond: "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  petit: "b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9",
  maury: "c3d4e5f6-g7h8-9012-i3j4-k5l6m7n8o9p0",
};

const sessionIds = {
  faune: "d4e5f6g7-h8i9-0123-j4k5-l6m7n8o9p0q1",
  dechets: "e5f6g7h8-i9j0-1234-k5l6-m7n8o9p0q1r2",
  flore: "f6g7h8i9-j0k1-2345-l6m7-n8o9p0q1r2s3",
};

const userSessionIds = {
  dupondFaune: "g7h8i9j0-k1l2-3456-m7n8-o9p0q1r2s3t4",
  petitDechets: "h8i9j0k1-l2m3-4567-n8o9-p0q1r2s3t4u5",
  petitFlore: "i9j0k1l2-m3n4-5678-o9p0-q1r2s3t4u5v6",
};

const sightingIds = {
  fauneChenille: "j0k1l2m3-n4o5-6789-p0q1-r2s3t4u5v6w7",
  dechetsMegot: "k1l2m3n4-o5p6-7890-q1r2-s3t4u5v6w7x8",
  dechetsCanette: "l2m3n4o5-p6q7-8901-r2s3-t4u5v6w7x8y9",
};

export const users: User[] = [
  {
    id: userIds.dupond,
    created_at: new Date().toISOString(), // LATER
    updated_at: new Date().toISOString(), // LATER
    lastname: "Dupond",
    firstname: "Jean",
    phone: "0612345601",
    email: "marc.dutoo+jean.dupond@gmail.com",
  },
  {
    id: userIds.petit,
    created_at: new Date().toISOString(), // LATER
    updated_at: new Date().toISOString(), // LATER
    lastname: "Petit",
    firstname: "Anne",
    phone: "0612345610",
    email: "marc.dutoo+anne.petit@gmail.com",
  },
  {
    id: userIds.maury,
    created_at: new Date().toISOString(), // LATER
    updated_at: new Date().toISOString(), // LATER
    lastname: "Maury",
    firstname: "Claude",
    phone: "0612345611",
    email: "marc.dutoo+claude.maury@gmail.com",
  },
];

export const sessions: Session[] = [
  {
    id: sessionIds.faune,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: userIds.dupond,
    name: "Observation de la faune",
    address_name: "Parc de la Tête d'Or, Boulevard des Belges, 69006 Lyon",
    //address_name: "Parc de la Tête d'Or",
    //address_streetno: "Boulevard des Belges",
    //address_complement: null,
    //address_city: "Lyon",
    //address_zipcode: "69006",
    location: { type: "Point", coordinates: [4.8471805, 45.7706118] },
    status: "created",
    notes: null,
    sync_status: "SYNCED"
  },
  {
    id: sessionIds.dechets,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: userIds.petit,
    name: "Collecte déchets",
    address_name: "place Jean Monnet, coté nord, 22 Av. René Cassin, 69009 Lyon",
    //address_name: "place Jean Monnet",
    //address_streetno: "22 Av. René Cassin",
    //address_complement: "coté nord",
    //address_city: "Lyon",
    //address_zipcode: "69009",
    location: { type: "Point", coordinates: [4.8048585, 45.7696557] },
    status: "created",
    notes: null,
    sync_status: "SYNCED"
  },
  {
      id: sessionIds.flore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: userIds.petit,
      name: "Observation de la flore",
      address_name: "Parc Du Lac De La Madone, 69440 Mornant",
      //address_name: "Parc Du Lac De La Madone",
      //address_streetno: null,
      //address_complement: null,
      //address_city: "Mornant",
      //address_zipcode: "69440",
      location: { type: "Point", coordinates: [4.653953, 45.6110466] },
      status: "created",
      notes: null,
      sync_status: "SYNCED"
  },
];


export interface UserSession {
  user_id: string;
  session_id: string;
  updated_at: string;
}
export const userSessions: UserSession[] = [
  { user_id: userIds.dupond, session_id: sessionIds.faune, updated_at: new Date().toISOString() },
  { user_id: userIds.petit, session_id: sessionIds.dechets, updated_at: new Date().toISOString() },
  { user_id: userIds.petit, session_id: sessionIds.flore, updated_at: new Date().toISOString() },
];

export const observations: Observation[] = [ // LATER rename Sighting ?
  {
    id: sightingIds.fauneChenille,
    session_id: sessionIds.faune,
    user_id: userIds.dupond,
    created_at: "2025-12-29T15:24:13.170699+01:00",
    updated_at: new Date().toISOString(),
    status: "created",
    status_changed_at: new Date().toISOString(),
    location: { type: "Point", coordinates: [4.8541807, 45.7781497] },
    category: "Espèce invasive",
    nombre: 1,
    poids_g: null,
    notes: "chenille processionnaire",
    sync_status: "SYNCED",
  },
  {
    id: sightingIds.dechetsMegot,
    session_id: sessionIds.dechets,
    user_id: userIds.petit,
    created_at: "2026-01-28T16:24:13.170699+01:00",
    updated_at: new Date().toISOString(),
    status: "created",
    status_changed_at: new Date().toISOString(),
    location: { type: "Point", coordinates: [4.8067673, 45.770202] },
    category: "Mégot de cigarette",
    nombre: 3,
    poids_g: null,
    notes: "mégot",
    sync_status: "SYNCED",
  },
  {
    id: sightingIds.dechetsCanette,
    session_id: sessionIds.dechets,
    user_id: userIds.petit,
    created_at: "2026-12-29T17:14:13.170699+01:00",
    updated_at: new Date().toISOString(),
    status: "created",
    status_changed_at: new Date().toISOString(),
    location: { type: "Point", coordinates: [4.8070193, 45.770327] },
    category: "Déchet métallique",
    nombre: 1,
    poids_g: null,
    notes: "canette",
    sync_status: "ERROR",
  },
];