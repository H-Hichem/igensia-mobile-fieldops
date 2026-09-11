import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react';
import { CSSProperties } from 'react';
import { locateOutline } from 'ionicons/icons';
import { useCurrentPosition } from '../hooks/useCurrentPosition';
import { useMovableMarkerMap } from '../hooks/useMovableMarkerMap';

interface Position {
  latitude: number;
  longitude: number;
}

interface Props {
  isOpen: boolean;
  initialPosition: Position;
  onCancel: () => void;
  onConfirm: (position: Position) => void;
}

export function LocationPickerModal({ isOpen, initialPosition, onCancel, onConfirm }: Props) {
  const { getCurrentPosition } = useCurrentPosition();
  const { mapElementRef, position, setPosition } = useMovableMarkerMap({ initialPosition });

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onCancel} style={{ '--background': 'transparent' } as CSSProperties}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel}>Annuler</IonButton>
          </IonButtons>
          <IonTitle>Choisir la position</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => /* TODO appeler onConfirm() */ position && onConfirm(position)} strong>
              Valider
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': 'transparent' } as CSSProperties}>
        { /* TODO map */ }
        <capacitor-google-map
          ref={mapElementRef}
          style={{ display: 'inline-block', width: '100%', height: '100%' }}
        />
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={async () => /* TODO reinit la position à la courante*/ setPosition(await getCurrentPosition())}>
            <IonIcon icon={locateOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonModal>
  );
}
