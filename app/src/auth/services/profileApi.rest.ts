import { API_BASE } from '../../config';

export const profileApiRest = {
  async deleteData(token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Impossible de supprimer les donnees');
  },

  async updatePreferences(token: string, patch: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${API_BASE}/profile/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Impossible de mettre a jour les preferences');
  },
};
