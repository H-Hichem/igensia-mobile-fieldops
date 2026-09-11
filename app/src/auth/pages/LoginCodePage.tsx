import { IonContent, IonPage, IonButton, IonText } from '@ionic/react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OtpInput } from '../components/OtpInput';
import { useAuth } from '../context/AuthContext';
//import { ROUTES } from '../../app/routes';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

// "Connexion" - etape 2 : saisie du code recu par email, verification automatique
// des que les 6 chiffres sont saisis.
export default function LoginCodePage() {
  const { pendingEmail, verifyCode, requestCode } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Sans email en attente (acces direct a l'URL, refresh de page...), on repart
  // de la saisie de l'email : impossible de verifier un code sans savoir pour qui.
  /* NO redirects to email after code OK ! several times and the last one with empty code...
  useEffect(() => {
    if (!pendingEmail) {
      console.log('LoginCodePage - no pendingEmail, navigate to /login/email');
      navigate(ROUTES.loginEmail, { replace: true });
    }
  }, [pendingEmail, code, isVerifying, navigate]);
  */

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (value: string) => {
      setIsVerifying(true);
      setError(null);
      try {
        await verifyCode(value);
        // AppBootstrap (route "/") prend le relais : verifie la seance en cours
        // et redirige vers le bon ecran.
        navigate('/', { replace: true });
      } catch {
        setError('Code invalide ou expire.');
        setCode('');
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyCode, navigate]
  );

  useEffect(() => {
    if (code.length === CODE_LENGTH) handleVerify(code);
  }, [code, handleVerify]);

  const handleResend = async () => {
    if (!pendingEmail || cooldown > 0) return;
    setError(null);
    await requestCode(pendingEmail);
    setCooldown(RESEND_COOLDOWN_SECONDS);
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
          <h1 style={{ textAlign: 'center', marginBottom: 0 }}>Verification</h1>
          <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>
            Code envoye a {pendingEmail}
          </p>

          <OtpInput length={CODE_LENGTH} value={code} onChange={setCode} disabled={isVerifying} />

          {error && (
            <IonText color="danger" style={{ textAlign: 'center', display: 'block' }}>
              {error}
            </IonText>
          )}

          <IonButton fill="clear" disabled={cooldown > 0} onClick={handleResend}>
            {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer le code'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
