import { IonIcon, IonButton, IonItem, IonLabel } from '@ionic/react';
import { locationOutline, locateOutline } from 'ionicons/icons';
import { useState } from 'react';
import { LocationPickerModal } from '../../shared/components/LocationPickerModal';
import { useCurrentPosition } from '../../shared/hooks/useCurrentPosition';
import { useConfirm } from '../../shared/hooks/useConfirm';

interface Position {
  latitude: number;
  longitude: number;
}

interface Props {
  value: Position;
  onChange: (position: Position) => void;
  // A true sur l'ecran Observation (edition) : chaque changement de position est
  // confirme avant d'etre applique. A false en creation.
  requireConfirm?: boolean;
}

export function PositionField({ value, onChange, requireConfirm = false }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { getCurrentPosition } = useCurrentPosition();
  const { confirm, dialog } = useConfirm();

  const applyChange = async (next: Position, message: string) => {
    if (requireConfirm) {
      const ok = await confirm(message);
      if (!ok) return;
    }
    onChange(next);
  };

  return (
    <IonItem lines="none">
      <IonIcon icon={locationOutline} slot="start" aria-hidden="true" />
      <IonLabel>
        <p>
          {value.longitude.toFixed(5)}, {value.latitude.toFixed(5)}
        </p>
      </IonLabel>
      <IonButton fill="outline" size="small" onClick={() => setPickerOpen(true)}>
        Choisir sur la carte...
      </IonButton>
      <IonButton
        fill="clear"
        onClick={async () => {
          const current = await getCurrentPosition();
          applyChange(current, 'Reinitialiser la position a votre position actuelle ?');
        }}
        aria-label="Reinitialiser a la position actuelle"
      >
        <IonIcon icon={locateOutline} slot="icon-only" />
      </IonButton>

      <LocationPickerModal
        isOpen={pickerOpen}
        initialPosition={value}
        onCancel={() => setPickerOpen(false)}
        onConfirm={(pos) => {
          setPickerOpen(false);
          applyChange(pos, 'Confirmer la nouvelle position selectionnee ?');
        }}
      />
      {dialog}
    </IonItem>
  );
}
