import { Observation, ObservationInput, Photo, PhotoInput, GeoJSONPoint } from '../types';
import { API_BASE } from '../../config';

// Implementation REST classique, gardee en parallele de Hasura (voir
// BACKEND dans config.ts).
export const observationsApiRest = {
  async fetchBySession(token: string, sessionId: string): Promise<Observation[]> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/observations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Impossible de recuperer les observations');
    return res.json();
  },

  async fetchNearby(
    token: string,
    position: GeoJSONPoint,
    limit = 20,
    radiusMeters = 1000000
  ): Promise<Observation[]> {
    const [lng, lat] = position.coordinates;
    const res = await fetch(
      `${API_BASE}/observations/closest?lat=${lat}&lng=${lng}&limit=${limit}&radius=${radiusMeters}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Impossible de recuperer les observations proches');
    return res.json();
  },

  async fetchOne(token: string, sessionId: string, observationId: string): Promise<Observation> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/observations/${observationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Impossible de recuperer l'observation");
    return res.json();
  },

  async create(
    token: string,
    sessionId: string,
    input: ObservationInput & { user_id: string }
  ): Promise<Observation> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Impossible de creer l'observation");
    return res.json();
  },

  async update(
    token: string,
    sessionId: string,
    observationId: string,
    input: ObservationInput
  ): Promise<Observation> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/observations/${observationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Impossible de modifier l'observation");
    return res.json();
  },

  async delete(
    token: string,
    sessionId: string,
    observationId: string,
  ): Promise<Observation> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/observations/${observationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Impossible de supprimer l'observation");
    return res.json();
  },

  async addPhoto(
    token: string,
    observationId: string,
    input: PhotoInput
  ): Promise<Photo> {
    const res = await fetch(`${API_BASE}/observations/${observationId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Impossible de creer la photo");
    return res.json();
  }
};
