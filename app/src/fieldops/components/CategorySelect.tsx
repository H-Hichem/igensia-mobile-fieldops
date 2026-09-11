import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { ObservationCategory, OBSERVATION_CATEGORIES } from '../types';

interface Props {
  value: ObservationCategory | null;
  onChange: (value: ObservationCategory) => void;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, disabled }: Props) {
  return (
    <IonItem lines="none">
      <IonLabel position="stacked">Categorie</IonLabel>
      <IonSelect
        value={value}
        placeholder="Choisir une categorie"
        interface="popover"
        disabled={disabled}
        onIonChange={(e) => onChange(e.detail.value)}
      >
        {OBSERVATION_CATEGORIES.map((cat) => (
          <IonSelectOption key={cat} value={cat}>
            {cat}
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>
  );
}
