import { API_BASE } from '../../config';

export interface GraphQLErrorItem {
  message: string;
  [key: string]: unknown;
}

export class GraphQLRequestError extends Error {
  constructor(public errors: GraphQLErrorItem[]) {
    super(errors.map((e) => e.message).join('; '));
  }
}

// Appel GraphQL brut vers Hasura - pour l'instant l'app pointe directement
// dessus via API_BASE ; a terme, API_BASE pointera vers le serveur Node
// d'auth qui proxifiera /graphql vers Hasura (une seule URL cote app dans les
// deux cas, ce fichier n'aura rien a changer).
// Pas de client GraphQL (Apollo/urql) : juste fetch + gestion d'erreurs,
// suffisant pour ce perimetre et plus simple a lire pour un exercice.
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(2000), // timeout court pour offline
  });

  if (!res.ok) {
    throw new Error(`Erreur reseau GraphQL (${res.status})`);
  }

  const body = await res.json();
  if (body.errors?.length) {
    throw new GraphQLRequestError(body.errors);
  }
  return body.data as T;
}
