import { IonItem, IonLabel, IonNote } from '@ionic/react';

interface Props {
  observationCount: number;
  totalWeightGrams: number;
  areaSquareMeters: number;
}

// Lignes en lecture seule. A "Nouvelle seance" les valeurs sont a 0 (aucune
// observation encore) ; le meme composant sera reutilise sur l'ecran "Seance"
// une fois les statistiques reelles calculees cote backend.
export function SessionStats({ observationCount, totalWeightGrams, areaSquareMeters }: Props) {
  return (
    <>
      <IonItem lines="none">
        <IonLabel>Nombre d'observations</IonLabel>
        <IonNote slot="end">{observationCount}</IonNote>
      </IonItem>
      <IonItem lines="none">
        <IonLabel>Poids total</IonLabel>
        <IonNote slot="end">{totalWeightGrams} g</IonNote>
      </IonItem>
      <IonItem lines="none">
        <IonLabel>Aire couverte</IonLabel>
        <IonNote slot="end">{areaSquareMeters} m2</IonNote>
      </IonItem>
    </>
  );
}
