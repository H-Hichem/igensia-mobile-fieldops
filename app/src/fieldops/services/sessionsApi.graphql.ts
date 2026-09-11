import { Session, SessionInput, GeoJSONPoint } from '../types';
import { graphqlRequest } from '../../shared/services/graphqlClient';

// Convention de nommage Hasura par defaut (pas de renommage manuel suppose) :
// champ racine = nom de table exact ("session"), suffixe _by_pk pour un id,
// insert_<table>_one pour une insertion unitaire.
const SESSION_FIELDS = `
  id
  created_at
  updated_at
  owner_id
  status
  name
  notes
  location
  address_name
  address_streetno
  address_complement
  address_city
  address_zipcode
  sync_status
`;

export const sessionsApiGraphql = {
  async fetchNearby(
    token: string,
    position: GeoJSONPoint,
    limit = 20,
    radiusMeters = 1000000
  ): Promise<Session[]> {
    const data = await graphqlRequest<{
      search_closest_session: { distance: number; session: Session }[];
    }>(
      `query ClosestSessions($center_location: geometry!, $limit: Int!, $distance_m: Int!) {
        search_closest_session(args: { center_location: $center_location, distance_m: $distance_m }, limit: $limit) {
          distance
          session {
            ${SESSION_FIELDS}
          }
        }
      }`,
      { center_location: position, limit, distance_m: radiusMeters },
      token
    );
    return data.search_closest_session.map(({ session }) => session);
  },
  
  async fetchOne(token: string, sessionId: string): Promise<Session | null> {
    const data = await graphqlRequest<{ session_by_pk: Session | null }>(
      `query SessionById($id: String!) {
        session_by_pk(id: $id) { ${SESSION_FIELDS} }
      }`,
      { id: sessionId },
      token
    );
    return data.session_by_pk;
  },

  // input DOIT comprendre owner_id
  // status/sync_status ont des valeurs par defaut
  // en base, pas besoin de les fournir
  async create(token: string, input: SessionInput & { owner_id: string }): Promise<Session> {
    const data = await graphqlRequest<{ insert_session_one: Session }>(
      `mutation CreateSession($object: session_insert_input!) {
        insert_session_one(object: $object) { ${SESSION_FIELDS} }
      }`,
      { object: input },
      token
    );
    return data.insert_session_one;
  },
};
