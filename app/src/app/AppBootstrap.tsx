import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { useCurrentSession } from '../fieldops/context/CurrentSessionContext';
import { ROUTE_PATTERNS } from './routes';
import { SESSIONS_ENABLED } from '../config';

// Rendu a la racine ("/"). Ne montre jamais rien de plus qu'un splash screen :
// - tant que le token n'a pas ete verifie (isInitializing) -> splash
// - si SESSIONS_ENABLED est faux (v1) : va directement sur /observations, sans
//   verifier de seance - il n'y en a pas de notion a ce stade
// - sinon (v2), une fois connecte, tant que la seance en cours n'a pas ete
//   verifiee -> splash, puis redirige vers l'ecran approprie
export function AppBootstrap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitializing } = useAuth();
  const { currentSession, refresh } = useCurrentSession();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (isInitializing || !user) return;
    // init currentSession :
    // (et si !SESSIONS_ENABLED créé une session par défaut si besoin)
    refresh().finally(() => !sessionChecked && setSessionChecked(true));
  }, [isInitializing, user, sessionChecked, refresh, setSessionChecked]);
  
  // 2. Safe Navigation Effect: Replaces direct <Navigate /> rendering
  useEffect(() => {
    // Wait until loading states resolve
    if (isInitializing) return;

    if (!user) {
      // If not logged in, and NOT already on the login path, route safely to login
      if (!location.pathname.startsWith('/login')) {
        console.log('AppBoostrap - no user, not logging in : to /login', ';', user, isInitializing, currentSession, location.pathname);
        navigate(ROUTE_PATTERNS.loginEmail, { replace: true });
      }
    } else if (location.pathname === '/' || location.pathname.startsWith('/login')) {
      // If logged in but lingering on root/login pages, route forward to observations or sessions
      const to = !SESSIONS_ENABLED ?  '/observations'
        : currentSession ? `/session/${currentSession.id}`
        : ROUTE_PATTERNS.sessionNewMap
      console.log('AppBoostrap - user, from /(login) : to ', to, ';', user, isInitializing, currentSession, location.pathname);
      navigate(to, { replace: true });
    }
  }, [user, isInitializing, currentSession, location.pathname, navigate]);

  // 3. Render purely layout frames or structural children
  if (isInitializing) {
    return <SplashScreen />;
  }

  // Always return an Outlet so children (/login, /login/code, /observations) have a window to display
  return <Outlet />;
}

function SplashScreen() {
  return (
    <IonPage>
      <IonContent className="ion-padding fo-splash" fullscreen>
        <div className="fo-splash__logo">FieldOps</div>
      </IonContent>
    </IonPage>
  );
}
