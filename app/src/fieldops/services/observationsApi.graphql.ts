import { Observation, ObservationInput, Photo, PhotoInput, GeoJSONPoint } from '../types';
import { graphqlRequest } from '../../shared/services/graphqlClient';

// Convention de nommage Hasura par defaut (pas de renommage manuel suppose) :
// champ racine = nom de table exact ("session"), suffixe _by_pk pour un id,
// insert_<table>_one pour une insertion unitaire.
const OBSERVATION_FIELDS = `
  id
  session_id
  user_id
  created_at
  updated_at
  status
  status_changed_at
  location
  category
  nombre
  poids_g
  notes
  sync_status
  user { id firstname lastname email }
  photos { id created_at updated_at data mime_type }
`;

const PHOTO_FIELDS = `
  id
  observation_id
  created_at
  updated_at
  data
  mime_type
`;


export const observationsApiGraphql = {
  async fetchBySession(token: string, sessionId: string): Promise<Observation[]> {
    const data = await graphqlRequest<{ observation: Observation[] }>(
      `query ObservationsBySession($sessionId: String!) {
        observation(where: { session_id: { _eq: $sessionId }, status: { _neq: "deleted" } }, order_by: { created_at: desc }) {
          ${OBSERVATION_FIELDS}
        }
      }`,
      { sessionId },
      token
    );
    return data.observation;
  },

  async fetchNearby(
    token: string,
    position: GeoJSONPoint,
    limit = 20,
    radiusMeters = 1000000
  ): Promise<Observation[]> {
    const data = await graphqlRequest<{
      search_closest_observation: { distance: number; observation: Observation }[];
    }>(
      `query ClosestObservations($center_location: geometry!, $limit: Int!, $distance_m: Int!) {
        search_closest_observation(args: { center_location: $center_location, distance_m: $distance_m }, limit: $limit) {
          distance
          observation {
            ${OBSERVATION_FIELDS}
          }
        }
      }`,
      { center_location: position, limit, distance_m: radiusMeters },
      token
    );
    return data.search_closest_observation.map(({ observation }) => observation);
  },

  async fetchOne(token: string, _sessionId: string, observationId: string): Promise<Observation> {
    const data = await graphqlRequest<{ observation_by_pk: Observation | null }>(
      `query ObservationById($id: String!) {
        observation_by_pk(id: $id) { ${OBSERVATION_FIELDS} }
      }`,
      { id: observationId },
      token
    );
    if (!data.observation_by_pk) throw new Error("Impossible de recuperer l'observation");
    return data.observation_by_pk;
  },

  // session_id fourni separement (parametre dedie), user_id doit etre inclus
  // dans input (voir useDataService, qui l'y ajoute).
  async create(
    token: string,
    sessionId: string,
    input: ObservationInput & { user_id: string }
  ): Promise<Observation> {
    //const photos = await Promise.all((input.photos || []).map(async p => { return { ...p, data: await hexDump(p.data) }}));
    const data = await graphqlRequest<{ insert_observation_one: Observation }>(
      `mutation CreateObservation($object: observation_insert_input!) {
        insert_observation_one(object: $object) { ${OBSERVATION_FIELDS} }
      }`,
      { object: { ...input, photos: { data: input.photos }, session_id: sessionId } },
      token
    );
    return data.insert_observation_one;
  },

  async update(
    token: string,
    _sessionId: string,
    observationId: string,
    input: ObservationInput
  ): Promise<Observation> {
    const data = await graphqlRequest<{ update_observation_by_pk: Observation }>(
      `mutation UpdateObservation($id: String!, $set: observation_set_input!) {
        update_observation_by_pk(pk_columns: { id: $id }, _set: $set) { ${OBSERVATION_FIELDS} }
      }`,
      { id: observationId, set: input },
      token
    );
    return data.update_observation_by_pk;
  },

  async delete(
    token: string,
    _sessionId: string,
    observationId: string,
  ): Promise<Observation> {
    const data = await graphqlRequest<{ update_observation_by_pk: Observation }>(
      `mutation UpdateObservation($id: String!, $set: observation_set_input!) {
        update_observation_by_pk(pk_columns: { id: $id }, _set: $set) { ${OBSERVATION_FIELDS} }
      }`,
      { id: observationId, set: { status: 'deleted' } },
      token
    );
    return data.update_observation_by_pk;
  },

  async addPhoto(
    token: string,
    observationId: string,
    input: PhotoInput
  ): Promise<Photo> {
    const data = await graphqlRequest<{ insert_photo_one: Photo }>(
      `mutation CreatePhoto($object: photo_insert_input!) {
        insert_photo_one(object: $object) { ${PHOTO_FIELDS} }
      }`,
      { object: { ...input, observation_id: observationId } },
      token
    );
    return data.insert_photo_one;
  }
};
