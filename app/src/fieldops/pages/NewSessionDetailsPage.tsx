import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonInput, IonItem, IonLabel, IonTextarea, IonButton, IonNote, IonSpinner } from '@ionic/react';
import { FieldsScreenLayout } from '../../shared/layout/FieldsScreenLayout';
import { SessionStats } from '../components/SessionStats';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { useDataService } from '../../shared/hooks/useDataService';
import { useCurrentSession } from '../context/CurrentSessionContext';
import { ROUTES } from '../../app/routes';

interface Position {
  latitude: number;
  longitude: number;
}

interface LocationState {
  position?: Position;
}

// "Nouvelle seance" - etape 2 : nom, position (issue de l'etape carte), adresse
// (reverse geocoding), notes, statistiques (a 0, aucune observation encore), createur.
export default function NewSessionDetailsPage() {
  // React Router v6 : useLocation() n'accepte plus de generique, le state est
  // typee `unknown` -> on le caste nous-memes.
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const navigate = useNavigate();
  const dataService = useDataService();
  const { setCurrentSession } = useCurrentSession();

  const [position, setPosition] = useState<Position | null>(locationState?.position ?? null);
  const [nom, setNom] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isLoading: isGeocoding } = useReverseGeocode(position);

  const handleSubmit = async () => {
    if (!position || !nom.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const session = await dataService.sessions.create({
        name: nom.trim(),
        // GeoJSON : coordinates = [longitude, latitude], dans cet ordre.
        location: { type: 'Point', coordinates: [position.longitude, position.latitude] },
        notes,
        // Avant cet alignement, l'adresse geocodee etait affichee mais jamais
        // envoyee a la creation - corrige au passage, maintenant que le champ existe.
        address_name: address ?? null,
      });
      setCurrentSession(session);
      console.log('NewSessionDetailPage - navigate back');
      navigate(-1);
    } catch {
      setError('Impossible de creer la seance. Reessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FieldsScreenLayout title="Nouvelle seance" defaultHref={ROUTES.sessionNewMap}>
      <IonItem lines="none">
        <IonLabel position="stacked">Nom</IonLabel>
        <IonInput value={nom} onIonInput={(e) => setNom(e.detail.value ?? '')} />
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Position</IonLabel>
        <IonNote>
          {position ? `${position.longitude.toFixed(5)}, ${position.latitude.toFixed(5)}` : '...'}
        </IonNote>
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Adresse</IonLabel>
        {isGeocoding ? <IonSpinner name="dots" /> : <IonNote>{address ?? 'Adresse introuvable'}</IonNote>}
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Notes</IonLabel>
        <IonTextarea value={notes} onIonChange={(e) => setNotes(e.detail.value ?? '')} />
      </IonItem>

      <SessionStats observationCount={0} totalWeightGrams={0} areaSquareMeters={0} />

      <IonItem lines="none">
        <IonLabel position="stacked">Createur</IonLabel>
        <IonNote>Vous</IonNote>
      </IonItem>

      {error && (
        <IonNote color="danger" style={{ display: 'block', margin: '8px 0' }}>
          {error}
        </IonNote>
      )}

      <IonButton
        expand="block"
        disabled={!nom.trim() || !position || isSubmitting}
        onClick={handleSubmit}
      >
        Creer
      </IonButton>
    </FieldsScreenLayout>
  );
}
