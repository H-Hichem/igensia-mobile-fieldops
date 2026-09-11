console.log("environment:")
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:6868';
console.log('API_BASE', API_BASE);

export const DEV_MODE_MOCK_DATA = import.meta.env.VITE_DEV_MODE_MOCK_DATA === 'false' ? false : true;
console.log('DEV_MODE_MOCK_DATA', DEV_MODE_MOCK_DATA);
console.log('import.meta.env.VITE_DEV_MODE_MOCK_DATA', import.meta.env.VITE_DEV_MODE_MOCK_DATA);

// v1 (TD) : false - masque toute l'UI de gestion des seances (menu burger,
// creation) ; l'app fonctionne uniquement sur le flux global "Observations
// proches", sans aucune notion de seance qui restreint ce qui est affiche.
// v2 (TP) : true - reactive la creation/affichage de seance ; la seance en
// cours (voir CurrentSessionContext) restreint alors les observations
// affichees sur le meme ecran (SessionPage), qui reste le meme composant dans
// les deux cas.
// Pour passer en v2 : VITE_SESSIONS_ENABLED=false dans .env, ou changer le
// defaut ci-dessous.
export const SESSIONS_ENABLED = import.meta.env.VITE_SESSIONS_ENABLED === 'true' ? true : false;
console.log('SESSIONS_ENABLED', SESSIONS_ENABLED);

// Selection du backend "reel" (hors mock)
// DEV_MODE_MOCK_DATA reste prioritaire sur ce flag.
export type ApiBackend = 'hasura' | 'rest';
export const BACKEND: ApiBackend =
  import.meta.env.VITE_BACKEND === 'rest' ? 'rest' : 'hasura';