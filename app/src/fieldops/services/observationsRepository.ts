import { Observation, ObservationInput, Photo, PhotoInput, GeoJSONPoint } from '../types';
import { observationsApi } from './observationsApi';
import { preferencesLocalStore } from '../../shared/services/localStore';
import { outbox } from '../../shared/services/outbox';

const OBSERVATIONS_KEY = 'observations';

const getLocalObservations = async () => {
  return (await preferencesLocalStore.get(OBSERVATIONS_KEY) || []) as Observation[];
}

export const updateLocalStoreForObservation = async (observation: Observation) => {
  const localObservations = await getLocalObservations();
  const ind = localObservations.map((o, ind) => o.id === observation.id ? ind : null).filter(ind => !!ind)[0];
  if (ind !== undefined && ind !== null) {
    // refresh que quand pas modifiée :
    if (localObservations[ind].sync_status === 'SYNCED') localObservations[ind] = observation;
  } else {
    localObservations.push(observation);
  }
  await preferencesLocalStore.set(OBSERVATIONS_KEY, localObservations);
}

export const observationsRepository = {
  
  async fetchBySession(token: string, sessionId: string): Promise<Observation[]> {
    try {
      const observations = await observationsApi.fetchBySession(token, sessionId);
      
      // Mise à jour du cache local
      const localObservations = await getLocalObservations();
      const localChangedObservations = localObservations.filter(lo => lo.sync_status !== 'SYNCED');
      const observationsWithoutLocalChanges = observations.filter(o => !localChangedObservations.find(lo => lo.id === o.id));
      
      await preferencesLocalStore.set(OBSERVATIONS_KEY, [...localChangedObservations, ...observationsWithoutLocalChanges]);
      return observations;
    } catch (e) {
      console.log('observationsRepository fetchBySession network error, returning cache', e);
      const localObservations = await getLocalObservations();
      return localObservations.filter(o => o.session_id === sessionId);
    }
  },

  async fetchNearby(
    token: string,
    position: GeoJSONPoint,
    limit = 20,
    radiusMeters = 1000000
  ): Promise<Observation[]> {
    try {
      const observations = await observationsApi.fetchNearby(token, position, limit, radiusMeters)
      
      const localObservations = await getLocalObservations();
      const localChangedObservations = localObservations.filter(lo => lo.sync_status !== 'SYNCED');
      const observationsWithoutLocalChanges = observations.filter(o => !localChangedObservations.find(lo => lo.id == o.id));
      
      await preferencesLocalStore.set(OBSERVATIONS_KEY, [...localChangedObservations, ...observationsWithoutLocalChanges]);
      return observations;
      
    } catch (e) {
      console.log('observationsRepository fetchNearby network error, returning cache', e);
      return await getLocalObservations();
    }
  },

  async fetchOne(token: string, sessionId: string, observationId: string): Promise<Observation> {
    try {
      const observation = await observationsApi.fetchOne(token, sessionId, observationId);
      await updateLocalStoreForObservation(observation);
      return observation;
      
    } catch (e) {
      console.log('observationsRepository fetchOne network error, returning cache', e);
      const localObservations = await getLocalObservations();
      const localObservation = localObservations.find(o => o.id === observationId);
      if (localObservation) {
        return localObservation;
      }
      throw 'Observation non trouvée dans le stockage local : ' + observationId;
    }
  },

  async create(
    token: string,
    sessionId: string,
    input: ObservationInput & { user_id: string }
  ): Promise<Observation> {
    const localObservations = await getLocalObservations();
    try {
      const observation = await observationsApi.create(token, sessionId, input);
      await updateLocalStoreForObservation(observation);
      return observation;
    } catch (e) {
      const err = (e instanceof Error) ? e as Error : null;
      const isNetworkError = err?.name === 'TimeoutError' || err?.message.includes('Network request failed') || err?.message.includes('Failed to fetch');
      
      if (isNetworkError) {
        console.log('observationsRepository create network error, updating cache and adding outbox operation', e);
        
        const nowISO601 = new Date().toISOString();
        const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36);

        const newObservation: Observation = {
          ...input,
          id: newId,
          session_id: sessionId,
          user_id: input.user_id,
          created_at: nowISO601, 
          updated_at: nowISO601,
          status: 'created',
          status_changed_at: nowISO601,
          sync_status: 'PENDING',
        } as Observation;

        localObservations.push(newObservation);
        await preferencesLocalStore.set(OBSERVATIONS_KEY, localObservations);

        const payload = { ...newObservation };
        delete payload.user;
        delete (payload as any).photos; // typescript workaround si non présent

        await outbox.enqueue({
          entity: 'observation',
          entityId: newObservation.id,
          sessionId: newObservation.session_id,
          operationType: 'create',
          payload,
        });

        return newObservation;
      }
      throw e;
    }
  },

  async update(
    token: string,
    sessionId: string,
    observationId: string,
    input: ObservationInput
  ): Promise<Observation> {
    const localObservations = await getLocalObservations();
    try {
      const observation = await observationsApi.update(token, sessionId, observationId, input);
      await updateLocalStoreForObservation(observation);
      return observation;
      
    } catch (e) {
      const err = (e instanceof Error) ? e as Error : null;
      const isNetworkError = err?.name === 'TimeoutError' || err?.message.includes('Network request failed') || err?.message.includes('Failed to fetch');
      
      if (isNetworkError) {
        console.log('observationsRepository update network error, updating cache and adding outbox operation', e);
  
        let updatedObservation: Observation;
        const singleIndList = localObservations.map((o, ind) => o.id === observationId ? ind : null).filter(ind => ind !== null);
        const hasLocalObservation = singleIndList?.length;
        if (hasLocalObservation) {
          const ind = singleIndList[0];
          updatedObservation = {
            ...(localObservations[ind as number]),
            ...input,
            sync_status: 'PENDING',
          };
          localObservations[ind as number] = updatedObservation;
        } else {
          const nowISO601 = new Date().toISOString();
          updatedObservation = {
            id: observationId,
            session_id: sessionId,
            user_id: 'dummy',
            created_at: nowISO601, 
            updated_at: nowISO601,
            status: 'created',
            status_changed_at: nowISO601,
            sync_status: 'PENDING',
            ...input
          } as Observation;
          localObservations.push(updatedObservation);
        }
        const payload = { ...updatedObservation };
        delete payload.user;
        delete (payload as any).photos;
        
        await outbox.enqueue({
          entity: 'observation',
          entityId: updatedObservation.id,
          sessionId: updatedObservation.session_id,
          operationType: 'update',
          payload,
        });
        
        await preferencesLocalStore.set(OBSERVATIONS_KEY, localObservations);
        return updatedObservation;
      }
      throw e;
    }
  },

  async delete(token: string, sessionId: string, observationId: string): Promise<Observation> {
    return await observationsApi.delete(token, sessionId, observationId);
  },

  async addPhoto(token: string, observationId: string, input: PhotoInput): Promise<Photo> {
    return await observationsApi.addPhoto(token, observationId, input);
  },

// Fonction pour vider l'outbox en rejouant les requêtes
  async syncAll(token: string): Promise<void> {
    const queue = await outbox.list();
    if (!queue || queue.length === 0) return;

    for (const item of queue) {
      if (item.entity === 'observation') {
        try {
          let syncedObservation: Observation | null = null;
          
          if (item.operationType === 'create') {
            syncedObservation = await observationsApi.create(token, item.sessionId as string, item.payload as any);
          } else if (item.operationType === 'update') {
            syncedObservation = await observationsApi.update(token, item.sessionId as string, item.entityId, item.payload as any);
          }

          if (syncedObservation) {
            // Remet le sync_status à SYNCED et met à jour le cache
            await updateLocalStoreForObservation(syncedObservation);
            // Retire de la file d'attente en utilisant l'ID de l'opération
            await outbox.remove(item.id); 
          }
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de l'observation ${item.entityId}`, error);
          // On marque l'échec pour incrémenter les attempts sans bloquer la suite
          await outbox.markFailed(item.id, String(error));
        }
      }
    }
  }
};