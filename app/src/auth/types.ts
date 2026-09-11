// Correspond a la table public.user du schema SQL.
export interface User {
  id: string;
  lastname: string;
  firstname: string;
  phone: string | null;
  email: string | null;
  // created_at/updated_at/status/preferences existent toujours en base (valeurs
  // par defaut), mais optionnels ici car pas encore renseignes dans les donnees
  // de mock actuelles - a resserrer (retirer le ?) une fois qu'ils le seront.
  created_at?: string;
  updated_at?: string;
  status?: string; // 'enabled' | 'disabled' | 'deleted' (pas fige dans le schema)
  // Cle 'current_session' notamment prevue pour la seance en cours stockee cote
  // serveur en complement du stockage local (Preferences) - pas encore exploitee.
  preferences?: { current_session?: string; [key: string]: unknown };
}
