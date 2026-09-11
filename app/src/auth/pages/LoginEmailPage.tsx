import { IonContent, IonPage, IonInput, IonButton, IonText } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../../app/routes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Connexion" - etape 1 : saisie de l'email, demande d'envoi du code.
// L'email n'apparait jamais dans l'URL : il est garde dans AuthContext (pendingEmail).
export default function LoginEmailPage() {
  const { requestCode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = EMAIL_REGEX.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    ///e.preventDefault(); // NO NEED stops the browser from reloading the PREVIOUS page
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await requestCode(email);
      navigate(ROUTES.loginCode);
    } catch {
      setError("Impossible d'envoyer le code. Verifiez l'adresse et reessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" scrollY={false}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            gap: 16,
            maxWidth: 360,
            margin: '0 auto',
          }}
        >
          <h1 style={{ textAlign: 'center', marginBottom: 0 }}>FieldOps</h1>
          <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>
            Connectez-vous avec votre adresse email, sans mot de passe.
          </p>

          <IonInput
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="vous@exemple.com"
            fill="outline"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value ?? '')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          />

          {error && <IonText color="danger">{error}</IonText>}

          <IonButton expand="block" disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            Recevoir un code
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
