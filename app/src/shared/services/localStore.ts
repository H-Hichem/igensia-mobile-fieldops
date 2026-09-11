import { Preferences } from '@capacitor/preferences';

// Store clé/valeur JSON générique, implémenté sur @capacitor/preferences pour
// l'instant. Encapsule derrière cette interface pour ses différents usages
// (lectures, écritures) et pour pouvoir le remplacer par exemple par
// SQLite plus tard
export interface LocalStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export const preferencesLocalStore: LocalStore = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value == null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      // Valeur corrompue/non-JSON, traitée comme absente
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
