import { useState } from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { mapOutline, listOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { BrowseScreenLayout } from '../../shared/layout/BrowseScreenLayout';
import SessionMapTab from '../components/SessionMapTab';
import SessionListTab from '../components/SessionListTab';

// Ecran de navigation (burger, pas de bouton back) avec deux onglets Carte/Liste.
// Deux facons d'y arriver, meme composant dans les deux cas :
// - /session/:id  -> titre "Seance", observations filtrees par cette seance
// - /observations -> titre "Observations proches", flux global - id est alors undefined
//
// PAS de sous-routage ici (pas d'IonTabs/IonRouterOutlet imbrique) : un simple
// state suffit, l'onglet actif n'a pas besoin d'etre dans l'URL. Ionic gere
// mal un IonRouterOutlet imbrique dans un autre en dev (voir main.tsx,
// suppression de StrictMode) - un state local est plus simple et plus robuste
// pour ce besoin.
export default function SessionPage() {
  const { id } = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  return (
    <BrowseScreenLayout title={id ? 'Seance' : 'Observations proches'} wrapInContent={false}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          {activeTab === 'map' ? <SessionMapTab /> : <SessionListTab />}
        </div>

        <IonTabBar slot="bottom">
          <IonTabButton tab="map" selected={activeTab === 'map'} onClick={() => setActiveTab('map')}>
            <IonIcon icon={mapOutline} />
            <IonLabel>Carte</IonLabel>
          </IonTabButton>
          <IonTabButton tab="list" selected={activeTab === 'list'} onClick={() => setActiveTab('list')}>
            <IonIcon icon={listOutline} />
            <IonLabel>Liste</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </div>
    </BrowseScreenLayout>
  );
}
