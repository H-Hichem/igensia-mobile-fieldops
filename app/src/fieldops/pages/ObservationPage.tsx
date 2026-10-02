import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldsScreenLayout } from '../../shared/layout/FieldsScreenLayout';
import { ObservationForm, ObservationFormValues } from '../components/ObservationForm';
import { useDataService } from '../../shared/hooks/useDataService';
import { Observation } from '../types';
import { ROUTES } from '../../app/routes';
import { IonItem, IonLabel, IonIcon } from '@ionic/react';
import { cloudOfflineOutline, warningOutline } from 'ionicons/icons';

// "Observation" : affichage + edition. Le createur est en lecture seule (passe a
// ObservationForm via la prop `creator`, jamais editable).
export default function ObservationPage() {
  const { id: sessionId, obsId } = useParams<{ id: string; obsId: string }>();
  const dataService = useDataService();
  const navigate = useNavigate();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!sessionId || !obsId) return;
    dataService.observations.fetchOne(sessionId, obsId).then(setObservation);
  }, [dataService, sessionId, obsId]);

  if (!observation || !sessionId) return null; // LATER etat de chargement / erreur

  const initialValues: ObservationFormValues = {
    id: observation.id,
    category: observation.category,
    // location peut etre absente (GPS refuse) : on retombe sur 0,0 plutot que
    // planter le formulaire. GeoJSON : coordinates[1]=latitude, coordinates[0]=longitude.
    latitude: observation.location?.coordinates[1] ?? 0,
    longitude: observation.location?.coordinates[0] ?? 0,
    nombre: observation.nombre,
    poids_g: observation.poids_g,
    notes: observation.notes ?? '',
    photos: observation.photos ?? [],
    sync_status: observation.sync_status ?? 'PENDING',
  };

  return (
    <FieldsScreenLayout title="Observation" defaultHref={ROUTES.session(sessionId)}>
      
      {/* --- AFFICHAGE DE L'ÉTAT DE SYNCHRONISATION --- */}
      {observation.sync_status === 'PENDING' && (
        <IonItem color="warning" lines="none">
          <IonIcon icon={cloudOfflineOutline} slot="start" />
          <IonLabel className="ion-text-wrap">
            <strong>Hors-ligne</strong> : En attente de synchronisation
          </IonLabel>
        </IonItem>
      )}
      {observation.sync_status === 'ERROR' && (
        <IonItem color="danger" lines="none">
          <IonIcon icon={warningOutline} slot="start" />
          <IonLabel className="ion-text-wrap">
            <strong>Erreur</strong> : Échec de la synchronisation
          </IonLabel>
        </IonItem>
      )}
      {/* ---------------------------------------------- */}

      <ObservationForm
        mode="edit"
        initialValues={initialValues}
        creator={observation.user}
        errorMessage={errorMessage}
        onSubmit={async (values) => {
          if (!values.category || !obsId) return;
          try {
            await dataService.observations.update(sessionId, obsId, {
              category: values.category,
              location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
              nombre: values.nombre,
              poids_g: values.poids_g,
              notes: values.notes,
            });
            // Retour a l'ecran d'avant, meme logique qu'a la creation.
            console.log('ObservationPage - navigate back');
            navigate(-1);
          } catch (e) {
            const err = (e instanceof Error) ? e as Error : null;
            setErrorMessage(err?.message || JSON.stringify(e, null, 2));
          }
        }}
        onDelete={async () => {
          if (!obsId) return;
          await dataService.observations.delete(sessionId, obsId);
          // Retour a l'ecran d'avant, meme logique qu'a la creation.
          console.log('ObservationPage - navigate back');
          navigate(-1);
        }}
      />
    </FieldsScreenLayout>
  );
}