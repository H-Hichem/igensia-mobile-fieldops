import { useEffect, useState, useCallback } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import { useDataService } from '../../shared/hooks/useDataService';
import { useCurrentPosition } from '../../shared/hooks/useCurrentPosition';
import { Observation } from '../types';

// sessionId optionnel : present -> observations de cette seance ; absent -> les
// plus proches de la position actuelle (pas de seance qui restreint l'affichage -
// v1, ou v2 sans seance en cours).
export function useSessionObservations(sessionId?: string) {
  const dataService = useDataService();
  const { getCurrentPosition } = useCurrentPosition();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (sessionId) {
        setObservations(await dataService.observations.fetchBySession(sessionId));
      } else {
        const position = await getCurrentPosition();
        setObservations(
          await dataService.observations.fetchNearby({
            type: 'Point',
            coordinates: [position.longitude, position.latitude],
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [dataService, sessionId, getCurrentPosition]);

  useEffect(() => {
    refresh();
  }, [refresh]);
  // pour que la vue se rafraichisse sur navigation y compris après modification :
  useIonViewWillEnter(() => {
    refresh();
  }, [refresh]);

  return { observations, isLoading, refresh };
}
