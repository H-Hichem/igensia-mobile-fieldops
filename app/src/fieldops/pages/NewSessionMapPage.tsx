import { IonContent, IonPage, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/react';
import { CSSProperties } from 'react';
import { locateOutline } from 'ionicons/icons';

// "Nouvelle seance" - carte centree sur la position actuelle, marqueur
// deplacable au tap. Le bouton cible n'apparait que si le marqueur a ete deplace
// (pas de reset utile s'il est deja sur la position actuelle).
export default function NewSessionMapPage() {
  const isMovedFromCurrent = false;

  return (
    <IonPage>
      <IonContent scrollY={false} style={{ '--background': 'transparent' } as CSSProperties}>
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', inset: 0, bottom: 72 }}>
            {/* TODO map */}

            {isMovedFromCurrent && (
              <IonFab vertical="bottom" horizontal="end" style={{ marginBottom: 16 }}>
                <IonFabButton
                  onClick={() => 'TODO Reinitialiser a la position actuelle'}
                  aria-label="Reinitialiser a la position actuelle"
                >
                  <IonIcon icon={locateOutline} />
                </IonFabButton>
              </IonFab>
            )}
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12 }}>
            <IonButton expand="block" disabled={false} onClick={() => ''}>
              Creer
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
