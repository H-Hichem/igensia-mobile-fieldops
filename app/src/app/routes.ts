// Chemins concrets, a utiliser pour construire des liens/redirections
export const ROUTES = {
  loginEmail: '/login',
  loginCode: '/login/code',
  // Ecran des observations SANS seance (v1, ou v2 sans seance en cours) - meme
  // composant SessionPage que la route /session/:id ci-dessous. L'onglet actif
  // (carte/liste) est un state interne a SessionPage, pas une sous-route.
  observations: '/observations',
  sessionNewMap: '/session/new',
  sessionNewDetails: '/session/new/details',
  session: (id: string) => `/session/${id}`,
  observationNew: (sessionId: string) => `/session/${sessionId}/observation/new`,
  observation: (sessionId: string, obsId: string) =>
    `/session/${sessionId}/observation/${obsId}`,
  profile: '/profile',
} as const;

// Patterns bruts, a utiliser dans les <Route path="...">
export const ROUTE_PATTERNS = {
  loginEmail: '/login',
  loginCode: '/login/code',
  observations: '/observations',
  sessionNewMap: '/session/new',
  sessionNewDetails: '/session/new/details',
  session: '/session/:id',
  observationNew: '/session/:id/observation/new',
  observation: '/session/:id/observation/:obsId',
  profile: '/profile',
} as const;
