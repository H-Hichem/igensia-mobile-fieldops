import { Session, SessionInput, GeoJSONPoint } from '../types';
import { API_BASE } from '../../config';

// Implementation REST classique, gardee en parallele de Hasura
// (voir BACKEND dans config.ts).
export const sessionsApiRest = {
  async fetchNearby(
    token: string,
    position: GeoJSONPoint,
    limit = 20,
    radiusMeters = 1000000
  ): Promise<Session[]> {
    const [lng, lat] = position.coordinates;
    const res = await fetch(
      `${API_BASE}/sessions/closest?lat=${lat}&lng=${lng}&limit=${limit}&radius=${radiusMeters}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Impossible de recuperer les observations proches');
    return res.json();
  },

  async fetchOne(token: string, sessionId: string): Promise<Session | null> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Impossible de recuperer la seance');
    return res.json();
  },

  async create(token: string, input: SessionInput & { owner_id: string }): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Impossible de creer la seance');
    return res.json();
  },
};
