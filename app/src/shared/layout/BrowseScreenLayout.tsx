import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonPage, IonContent } from '@ionic/react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  // Contenu affiche a droite de la toolbar (action contextuelle eventuelle)
  endSlot?: ReactNode;
  // A false quand l'ecran gere lui-meme son IonContent (ex: SessionPage avec IonTabs)
  wrapInContent?: boolean;
}

// Layout des ecrans "de navigation" (par opposition aux ecrans a champs, qui ont un
// bouton Back) : bouton burger a gauche du titre.
export function BrowseScreenLayout({ title, children, endSlot, wrapInContent = true }: Props) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          {endSlot && <IonButtons slot="end">{endSlot}</IonButtons>}
        </IonToolbar>
      </IonHeader>
      {wrapInContent ? <IonContent>{children}</IonContent> : children}
    </IonPage>
  );
}
