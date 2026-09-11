import { preferencesLocalStore, LocalStore } from './localStore';

export type SyncOperationType = 'create' | 'update';
// Pas de type 'delete' distinct : la suppression est un soft delete, donc en
// pratique un 'update' comme un autre (status: 'deleted') - voir
// docs/offline-sync.md.

export type SyncEntity = 'session' | 'observation';

export interface OutboxEntry {
  id: string; // id de l'opération elle-même (pas de l'entité concernée)
  entity: SyncEntity;
  entityId: string; // id (définitif, généré côté client) de l'entité concernée
  sessionId?: string; // pour une observation, sa séance parente
  operationType: SyncOperationType;
  payload: unknown; // données à envoyer (objet métier ou son diff)
  createdAt: string;
  attempts: number;
  lastError?: string;
}

const OUTBOX_KEY = 'outbox';

// queue d'outbox d'opérations (écritures) restant à réaliser sur le serveur.
// Toute la collection est lue / écrite en un seul objet JSON (pas une clé par
// entrée) : plus simple à manipuler de facon atomique avec Preferences.
// Pattern Factory pour rester testable/remplacable.
export function createOutbox(store: LocalStore = preferencesLocalStore) {
  async function list(): Promise<OutboxEntry[]> {
    return (await store.get<OutboxEntry[]>(OUTBOX_KEY)) ?? [];
  }

  async function enqueue(
    entry: Omit<OutboxEntry, 'id' | 'createdAt' | 'attempts'>
  ): Promise<OutboxEntry> {
    const entries = await list();
    const newEntry: OutboxEntry = {
      ...entry,
      id: crypto.randomUUID(), // génération id local
      createdAt: new Date().toISOString(),
      attempts: 0, // nombre de tentatives
    };
    await store.set(OUTBOX_KEY, [...entries, newEntry]);
    return newEntry;
  }

  // Seul le succès retire une entrée de l'outbox
  async function remove(entryId: string): Promise<void> {
    const entries = await list();
    await store.set(
      OUTBOX_KEY,
      entries.filter((e) => e.id !== entryId)
    );
  }

  // Utilisé après un échec : incrémente attempts et note la dernière erreur,
  // sans jamais retirer l'entrée.
  async function markFailed(entryId: string, error: string): Promise<void> {
    const entries = await list();
    await store.set(
      OUTBOX_KEY,
      entries.map((e) =>
        e.id === entryId ? { ...e, attempts: e.attempts + 1, lastError: error } : e
      )
    );
  }

  async function clear(): Promise<void> {
    await store.remove(OUTBOX_KEY);
  }

  return { list, enqueue, remove, markFailed, clear };
}

export const outbox = createOutbox();
