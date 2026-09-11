import { IonList, IonItem, IonLabel, IonNote, IonButton, IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSessionObservations } from '../hooks/useSessionObservations';
import { useCurrentSession } from '../context/CurrentSessionContext';
import { CATEGORY_CSS_VAR, DEFAULT_CATEGORY_CSS_VAR } from '../categories';
import { ROUTES } from '../../app/routes';

// Plus de IonContent propre ici (voir SessionMapTab) - le defilement de la
// liste est gere par un simple overflow-y sur son propre conteneur.
export default function SessionListTab() {
  const { id: sessionIdParam } = useParams<{ id?: string }>();
  const { currentSession } = useCurrentSession();
  const sessionId = sessionIdParam ?? currentSession?.id;
  const { observations } = useSessionObservations(sessionId);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <IonList>
          {observations.map((obs) => (
            <IonItem
              key={obs.id}
              button
              onClick={() => navigate(ROUTES.observation(obs.session_id, obs.id))}
            >
              <span
                slot="start"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: `var(${
                    (obs.category && CATEGORY_CSS_VAR[obs.category]) || DEFAULT_CATEGORY_CSS_VAR
                  })`,
                }}
              />
              <IonLabel>
                {/* category EST le libelle affiche desormais, plus besoin de lookup */}
                <h2>{obs.category ?? 'Sans categorie'}</h2>
                {obs.notes && <p>{obs.notes}</p>}
              </IonLabel>
              {obs.poids_g != null && <IonNote slot="end">{obs.poids_g} g</IonNote>}
            </IonItem>
          ))}
        </IonList>
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
