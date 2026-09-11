import { IonButton, IonIcon, IonNote } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSessionObservations } from '../hooks/useSessionObservations';
import { useCurrentSession } from '../context/CurrentSessionContext';
import { SessionMap } from './SessionMap';
import { ROUTES } from '../../app/routes';


// Plus de IonContent propre ici : SessionPage (le parent) possede desormais
// l'unique conteneur de l'ecran, ce composant ne rend que son contenu.
export default function SessionMapTab() {
  const { id: sessionIdParam } = useParams<{ id?: string }>();
  const { currentSession } = useCurrentSession();
  // Sur /observations (pas d'id dans l'URL), on retombe sur la seance en cours
  // si elle existe (utile pour "Nouvelle observation" - voir schema.sql,
  // observation.session_id reste NOT NULL meme en v1).
  const sessionId = sessionIdParam ?? currentSession?.id;
  const { observations, isLoading } = useSessionObservations(sessionId);
  const navigate = useNavigate();

  // Centre par defaut : premiere observation localisee ; LATER utiliser la
  // position de la seance elle-meme une fois SessionContext charge ici.
  // GeoJSON : coordinates = [longitude, latitude].
  const firstLocated = observations.find((o) => o.location);
  const center = firstLocated?.location
    ? { lat: firstLocated.location.coordinates[1], lng: firstLocated.location.coordinates[0] }
    : { lat: 45.5646, lng: 5.9178 };
    
  return (
    // background transparent : sur Android, la carte native est rendue SOUS
    // la webview - sans ca, elle reste invisible meme si elle existe bien.
    // Voir https://capacitorjs.com/docs/apis/google-maps#usage
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        {!isLoading && (
          <SessionMap
            center={center}
            observations={observations}
            onSelectObservation={(obs) =>
              navigate(ROUTES.observation(obs.session_id, obs.id))
            }
          />
        )}
      </div>
      <div style={{ padding: 12 }}>
        {sessionId ? (
          <IonButton
            expand="block"
            onClick={() => navigate(ROUTES.observationNew(sessionId))}
          >
            <IonIcon slot="start" icon={addOutline} />
            Nouvelle observation
          </IonButton>
        ) : (
          <IonNote style={{ display: 'block', textAlign: 'center' }}>
            Aucune seance active pour l'instant - impossible de creer une observation.
          </IonNote>
        )}
      </div>
    </div>
  );
}
