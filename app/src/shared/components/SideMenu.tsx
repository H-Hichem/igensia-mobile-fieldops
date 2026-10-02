import React, { useEffect, useState } from 'react';
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
import { outbox } from '../services/outbox';

export function SideMenu() {
  const { currentSession } = useCurrentSession();
  const dataService = useDataService();
  const [isSyncDisabled, setIsSyncDisabled] = useState(true);

  // Fonction pour vérifier si l'outbox contient des opérations en attente
  const checkOutboxStatus = async () => {
    const ops = await outbox.list();
    setIsSyncDisabled(ops.length === 0);
  };

  // Rafraîchir l'état du bouton toutes les 2 secondes
  useEffect(() => {
    checkOutboxStatus();
    const interval = setInterval(checkOutboxStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (dataService) {
      await dataService.syncAll();
      await checkOutboxStatus();
    }
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>FieldOps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/* Bouton Synchroniser avec gestion de l'état (grisé si outbox vide) */}
          <IonItem lines="none">
            <IonButton 
              disabled={isSyncDisabled} 
              onClick={handleSync}
            >
              <IonLabel>Synchroniser</IonLabel>
            </IonButton>
          </IonItem>
          
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