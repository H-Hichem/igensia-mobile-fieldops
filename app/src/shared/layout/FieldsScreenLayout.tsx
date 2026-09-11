import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonPage, IonContent } from '@ionic/react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  defaultHref?: string;
  endSlot?: ReactNode;
}

// Layout des ecrans "a champs" (Nouvelle observation, Observation, seance...) :
// bouton Back a gauche du titre, a la place du burger.
export function FieldsScreenLayout({ title, children, defaultHref = '/', endSlot }: Props) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref} text="" />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          {endSlot && <IonButtons slot="end">{endSlot}</IonButtons>}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{children}</IonContent>
    </IonPage>
  );
}
