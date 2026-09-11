import { IonItem, IonLabel, IonNote, IonButton, IonIcon } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowseScreenLayout } from '../../shared/layout/BrowseScreenLayout';
import { useAuth } from '../../auth/context/AuthContext';
import { useDataService } from '../../shared/hooks/useDataService';
import { useConfirm } from '../../shared/hooks/useConfirm';
import { ROUTES } from '../../app/routes';

// LATER remplacer par la vraie URL de la politique de confidentialite
const PRIVACY_POLICY_URL = 'https://fieldops.example.com/confidentialite';

// "Profil" - ecran de navigation (burger), pas bouton back : email/nom/prenom en
// lecture seule, lien vers la politique de confidentialite, suppression des donnees.
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const dataService = useDataService();
  const { confirm, dialog } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteData = async () => {
    const ok = await confirm(
      'Cette action supprime definitivement toutes vos donnees. Cette action est irreversible. Continuer ?',
      { header: 'Supprimer les donnees', confirmLabel: 'Supprimer' }
    );
    if (!ok) return;
    setIsDeleting(true);
    try {
      await dataService.profile.deleteData();
      await logout();
      navigate(ROUTES.loginEmail, { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BrowseScreenLayout title="Profil">
      <IonItem lines="none">
        <IonLabel position="stacked">Email</IonLabel>
        <IonNote>{user?.email}</IonNote>
      </IonItem>
      <IonItem lines="none">
        <IonLabel position="stacked">Nom</IonLabel>
        <IonNote>{user?.lastname}</IonNote>
      </IonItem>
      <IonItem lines="none">
        <IonLabel position="stacked">Prenom</IonLabel>
        <IonNote>{user?.firstname}</IonNote>
      </IonItem>
      <IonItem lines="none">
        <IonLabel position="stacked">Telephone</IonLabel>
        <IonNote>{user?.phone ?? '-'}</IonNote>
      </IonItem>

      <IonItem
        lines="none"
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        detail
      >
        <IonLabel>Politique de confidentialite</IonLabel>
        <IonIcon icon={openOutline} slot="end" />
      </IonItem>

      <IonButton
        expand="block"
        color="danger"
        fill="outline"
        disabled={isDeleting}
        onClick={handleDeleteData}
        style={{ marginTop: 24 }}
      >
        Supprimer ses donnees
      </IonButton>

      <IonButton
        expand="block"
        color="primary"
        fill="outline"
        onClick={() => logout()}
        style={{ marginTop: 24 }}
      >
        Se déconnecter
      </IonButton>

      {dialog}
    </BrowseScreenLayout>
  );
}
