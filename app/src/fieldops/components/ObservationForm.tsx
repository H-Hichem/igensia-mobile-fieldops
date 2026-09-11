import { IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonNote, IonImg, IonText } from '@ionic/react';
import { useState } from 'react';
import { CategorySelect } from './CategorySelect';
import { PositionField } from './PositionField';
import { useConfirm } from '../../shared/hooks/useConfirm';
import { useAuth } from '../../auth/context/AuthContext';
import { Observation, ObservationCategory, Photo, SyncStatus } from '../types';

import { photoToBase64ImgSrc, takePhoto } from '../utils';
import { useDataService } from '../../shared/hooks/useDataService';


export interface ObservationFormValues {
  id: string | undefined;
  category: ObservationCategory | null;
  latitude: number;
  longitude: number;
  nombre: number;
  poids_g: number | null;
  notes: string;
  photos: Photo[] | undefined;
  sync_status: SyncStatus;
}

interface Props {
  mode: 'create' | 'edit';
  initialValues: ObservationFormValues;
  // Absent en creation : vient de la relation user_id -> user, pas d'une colonne
  // directe de sighting.
  creator?: Observation['user'];
  errorMessage?: string;
  onSubmit: (values: ObservationFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

// Formulaire partage entre "Nouvelle observation" et "Observation" (edition) : memes
// champs, memes composants. En edition, tout changement passe par une confirmation
// prealable, sauf le champ notes qui s'applique directement.
export function ObservationForm({
  mode, initialValues, creator, errorMessage, onSubmit, onDelete
}: Props) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { confirm, dialog } = useConfirm();
  const dataService = useDataService();

  const requireConfirm = mode === 'edit';

  // NE PAS DEMANDER DE CONFIRMATION (ne pas fournir de message) quand utilisé
  // avec IonInput.onIonInuput, sinon déclenché à chaque caractère écrit.
  // (et ne pas utiilser IonInput.onChange qui déclenche le form submit AVANT)
  // https://forum.ionicframework.com/t/issues-with-state-updates-after-upgrading-to-ionic-react-7/239017/2
  // https://stackoverflow.com/questions/53316501/react-potential-race-condition-for-controlled-components
  const updateField = async <K extends keyof ObservationFormValues>(
    key: K,
    next: ObservationFormValues[K],
    message?: string
  ) => {
    if (requireConfirm && message) {
      const ok = await confirm(message);
      if (!ok) return;
    }
    setValues((v) => ({ ...v, [key]: next }));
  };

  // Les notes n'exigent jamais de confirmation, meme en edition
  const updateNotes = (notes: string) => setValues((v) => ({ ...v, notes }));

  const creatorLabel =
    mode === 'create'
      ? 'Vous'
      : creator && user && creator.id === user.id
      ? 'Vous'
      : creator
      ? `${creator.lastname} ${creator.firstname} - ${creator.email ?? ''}`
      : '';

  const handleSubmit = async () => {
    if (!values.category) return; // categorie obligatoire
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm('Êtes-vous sûr ?');
    if (!ok || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddPhoto = async () => {
    const p = await takePhoto();
    if (p && initialValues.id) {
      const createdPhoto = await dataService.observations.addPhoto(initialValues.id, p);
      setValues({ ...values, photos: [...(values.photos || []), createdPhoto] });
    }
  }

  return (
    <>
      <IonItem lines="none">
        <IonLabel position="stacked">Statut de synchronisation</IonLabel>
        <IonText color={values.sync_status === 'PENDING' ? 'warning' : values.sync_status === 'ERROR' ? 'danger' : 'primary'}>
          { values.sync_status } : { values.sync_status === 'PENDING' ? 'Tapez Menu > Synchroniser une fois le réseau revenu' : values.sync_status === 'ERROR' || errorMessage ? 'Veuillez corriger les données' : 'OK' }
        </IonText>
        { errorMessage && (
          <IonText color={values.sync_status === 'PENDING' ? 'warning' : values.sync_status === 'ERROR' ? 'danger' : 'primary'}>
            { errorMessage }
          </IonText>
        )}
      </IonItem>
    
      <CategorySelect
        value={values.category}
        onChange={(cat) =>
          updateField('category', cat, 'Modifier la categorie de cette observation ?')
        }
      />

      <PositionField
        value={{ latitude: values.latitude, longitude: values.longitude }}
        requireConfirm={requireConfirm}
        onChange={(pos) =>
          setValues((v) => ({ ...v, latitude: pos.latitude, longitude: pos.longitude }))
        }
      />

      <IonItem lines="none">
        <IonLabel position="stacked">Images</IonLabel>
        {values?.photos?.map(p => (
          <IonImg
            key={p.id}
            src={photoToBase64ImgSrc(p)}
            alt="photo"
          />
        ))}
        { mode !== 'create' && (
        <IonButton
          expand="block"
          disabled={!values.category || isSubmitting}
          onClick={handleAddPhoto}
        >
          Ajouter photo
        </IonButton>
        )}
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Nombre</IonLabel>
        <IonInput
          type="number"
          inputmode="numeric"
          value={values.nombre}
          onIonInput={(e) => {
            // onIonInput car PAS onIonChange sinon déclenche form submit avant !
            // (et pas confirm sinon sur chaque caractère)
            const next = e.detail.value ? Number(e.detail.value) : 1;
            updateField('nombre', next); // , 'Modifier le nombre pour cette observation ?'
          }}
        />
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Poids (g)</IonLabel>
        <IonInput
          type="number"
          inputmode="numeric"
          value={values.poids_g ?? ''}
          onIonInput={(e) => {
            // onIonInput car PAS onIonChange sinon déclenche form submit avant !
            // (et pas confirm sinon sur chaque caractère)
            const next = e.detail.value ? Number(e.detail.value) : null;
            updateField('poids_g', next); // , 'Modifier le poids pour cette observation ?'
          }}
        />
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Notes</IonLabel>
        <IonTextarea value={values.notes} onIonInput={(e) => // PAS onIonChange sinon déclenche form submit avant !
          updateNotes(e.detail.value ?? '')} />
      </IonItem>

      <IonItem lines="none">
        <IonLabel position="stacked">Createur</IonLabel>
        <IonNote>{creatorLabel}</IonNote>
      </IonItem>

      <IonButton
        expand="block"
        disabled={!values.category || isSubmitting}
        onClick={handleSubmit}
      >
        {mode === 'create' ? 'Creer' : 'Valider'}
      </IonButton>

      {mode !== 'create' && (
        <IonButton
          expand="block"
          disabled={isSubmitting}
          onClick={handleDelete}
        >
          Supprimer
        </IonButton>
      )}

      {dialog}
    </>
  );
}
