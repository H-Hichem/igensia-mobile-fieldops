import { Observation, ObservationInput, Photo, PhotoInput, GeoJSONPoint } from '../types';
import * as mockData from '../../mockData';

export const observationsApiMock = {
  async fetchBySession(_token: string, sessionId: string): Promise<Observation[]> {
    // Une seance sans observation est un cas normal (ex. seance tout juste
    // creee) : on renvoie [], pas une erreur.
    return mockData.observations.filter((o) => o.session_id === sessionId);
  },

  async fetchNearby(
    _token: string,
    _position: GeoJSONPoint,
    _limit = 20,
    _radiusMeters = 1000000
  ): Promise<Observation[]> {
    return mockData.observations;
  },

  async fetchOne(_token: string, _sessionId: string, observationId: string): Promise<Observation> {
    const observation = mockData.observations.find((o) => o.id === observationId);
    if (!observation) throw new Error("Impossible de recuperer l'observation");
    return observation;
  },

  async create(
    _token: string,
    _sessionId: string,
    _input: ObservationInput & { user_id: string }
  ): Promise<Observation> {
    throw new Error('observationsApi.create non implemente en mode mock');
  },

  async update(
    _token: string,
    _sessionId: string,
    _observationId: string,
    _input: ObservationInput
  ): Promise<Observation> {
    throw new Error('observationsApi.update non implemente en mode mock');
  },

  async delete(
    _token: string,
    _sessionId: string,
    _observationId: string,
  ): Promise<Observation> {
    throw new Error('observationsApi.delete non implemente en mode mock');
  },

  async addPhoto(
    _token: string,
    _observationId: string,
    _input: PhotoInput
  ): Promise<Photo> {
    throw new Error('observationsApi.addPhoto non implemente en mode mock');
  }
};
