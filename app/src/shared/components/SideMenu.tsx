import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCurrentSession } from '../../fieldops/context/CurrentSessionContext';
import { ROUTE_PATTERNS } from '../../app/routes';
import { useDataService } from '../hooks/useDataService';

export function SideMenu() {
  const { currentSession } = useCurrentSession();
  const dataService = useDataService();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>FieldOps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/* TODO rajouter un bouton Synchroniser qui appelle dataService.syncAll() */}
          <IonButton onClick={() => dataService?.syncAll() /* TODO appelez DataService.syncAll() depuis un bouton Synchroniser (IonButton onClick) à rajouter dans le Menu */}>
            <IonLabel>Synchroniser</IonLabel>
          </IonButton>
          {/* v1 (TD) : toujours une session implicite */}
          <IonMenuToggle autoHide={false}>
            {currentSession ? (
              <IonItem routerLink={`/session/${currentSession.id}`} lines="none">
                <IonLabel>Seance en cours</IonLabel>
              </IonItem>
            ) : (
              <IonItem routerLink={ROUTE_PATTERNS.sessionNewMap} lines="none">
                <IonLabel>Nouvelle seance</IonLabel>
              </IonItem>
            )}
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTE_PATTERNS.profile} lines="none">
              <IonLabel>Profil</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
}
