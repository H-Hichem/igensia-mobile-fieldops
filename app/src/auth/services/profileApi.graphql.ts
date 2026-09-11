import { graphqlRequest } from '../../shared/services/graphqlClient';

// Les mutations by_pk ont besoin de l'id explicitement, qu'on n'a pas ici
// (seulement le token) - plutot que de le faire remonter depuis AuthContext
// jusqu'ici, on utilise une mutation "bulk" avec un where toujours vrai
// (id IS NOT NULL) : c'est la permission Hasura (filtree sur
// X-Hasura-User-Id) qui restreint reellement l'operation a la ligne de
// l'utilisateur courant, pas ce where. Pattern standard Hasura pour ce cas
// de "agir sur MA propre ligne" sans avoir a connaitre son id cote client.
export const profileApiGraphql = {
  async deleteData(token: string): Promise<void> {
    await graphqlRequest(
      `mutation DeleteMyData {
        delete_user(where: { id: { _is_null: false } }) { affected_rows }
      }`,
      undefined,
      token
    );
  },

  // _append (pas _set) sur la colonne JSONB preferences : merge (via
  // l'operateur Postgres ||) plutot que de remplacer tout l'objet - important
  // puisque current_session n'est qu'une des cles possibles de preferences.
  async updatePreferences(token: string, patch: Record<string, unknown>): Promise<void> {
    await graphqlRequest(
      `mutation UpdateMyPreferences($patch: jsonb!) {
        update_user(where: { id: { _is_null: false } }, _append: { preferences: $patch }) {
          affected_rows
        }
      }`,
      { patch },
      token
    );
  },
};
