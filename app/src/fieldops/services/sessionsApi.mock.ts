import { Session, SessionInput, GeoJSONPoint } from '../types';
import * as mockData from '../../mockData';

export const sessionsApiMock = {
  async fetchNearby(
    _token: string,
    _position: GeoJSONPoint,
    _limit = 20,
    _radiusMeters = 1000000
  ): Promise<Session[]> {
    return mockData.sessions;
  },
  
  async fetchOne(_token: string, sessionId: string): Promise<Session | null> {
    return mockData.sessions.find((s) => s.id === sessionId) ?? null;
  },

  async create(_token: string, input: SessionInput & { owner_id: string }): Promise<Session> {
    throw new Error('sessionsApi.create non implemente en mode mock');
  },
};
