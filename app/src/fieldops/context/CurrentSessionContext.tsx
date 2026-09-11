import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { useAuth } from '../../auth/context/AuthContext';
import { sessionsApi } from '../services/sessionsApi';
import { profileApi } from '../../auth/services/profileApi';
import { Session, SessionInput } from '../types';
import { DEV_MODE_MOCK_DATA, SESSIONS_ENABLED } from '../../config';

const CURRENT_SESSION_ID_KEY = 'fieldops_current_session_id';

// informations de la session par défaut à créer en v1 (sans fonctionnalités
// session)
// owner_id doit en plus être fourni
export const DEFAULT_SESSION_DATA = {
  name: 'Défaut',
  notes: null,
  // GeoJSON : coordinates = [longitude, latitude], dans cet ordre.
  location: { type: 'Point', coordinates: [4.8265532, 45.7547089] },
  address_name: 'Place Bellecour, 69002 Lyon',
};

interface CurrentSessionContextValue {
  currentSession: Session | null;
  isLoading: boolean;
  // Determine l'id localement (Preferences, avec repli sur
  // user.preferences.current_session), puis charge la seance correspondante.
  refresh: () => Promise<Session | null | undefined>;
  // Ecrit immediatement en local (fonctionne hors ligne), et repercute cote
  // serveur en best-effort (jamais attendu, jamais bloquant).
  setCurrentSession: (session: Session | null) => void;
}

const CurrentSessionContext = createContext<CurrentSessionContextValue | undefined>(
  undefined
);

export function CurrentSessionProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [currentSession, setCurrentSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setCurrentSession = useCallback(
    (session: Session | null) => {
      setCurrentSessionState(session);
      (async () => {
        if (session) {
          await Preferences.set({ key: CURRENT_SESSION_ID_KEY, value: session.id });
        } else {
          await Preferences.remove({ key: CURRENT_SESSION_ID_KEY });
        }
        
        // Best-effort : si hors ligne ou en echec, le stockage local (ci-dessus)
        // reste la source de verite immediate - on ignore l'erreur ici.
        if (token) {
          profileApi
            .updatePreferences(token, { current_session: session?.id ?? null })
            .catch(() => {});
        }
      })();
    },
    [token]
  );

  const refresh = useCallback(async () => {
    if (!token) {
      setCurrentSessionState(null);
      return null;
    }
    setIsLoading(true);
    try {
      const { value: storedId } = await Preferences.get({ key: CURRENT_SESSION_ID_KEY });
      // Repli sur la valeur cote serveur si rien en local (ex. nouvel appareil) -
      // pas d'appel a une API /session/current dediee, juste le champ deja
      // recupere avec l'utilisateur courant.
      
      if (DEV_MODE_MOCK_DATA) {
        const mockSessions = await sessionsApi.fetchNearby('', { type: 'Point', coordinates: [0, 0]});
        const s = mockSessions[0];
        setCurrentSession(s);
        console.log('...Session en cours mock', s);
        return s;
      }
      
      const sessionId = storedId || user?.preferences?.current_session || null;
      if (sessionId) {
        console.log('Pour session en cours, réutilisation de', sessionId);
        const session = await sessionsApi.fetchOne(token, sessionId);
        if (session) {
          console.log('...Session en cours', session);
          setCurrentSessionState(session);
          return session;
        }
      }
      if (!SESSIONS_ENABLED && user?.id) {
        console.log('Création de session en cours par défaut...');
        // v1 : créer la session implicite "par défaut" de l'utilisateur
        // (sinon impossible de créer une observation)
        const defaultSessionCreated = await sessionsApi.create(token, {
          ...DEFAULT_SESSION_DATA,
          owner_id : user?.id,
        } as SessionInput & { owner_id: string });
        setCurrentSession(defaultSessionCreated);
        console.log('...Session en cours', defaultSessionCreated);
        return defaultSessionCreated;
      }
      setCurrentSessionState(null);
      return null;
    } catch (e) {
      console.log('CurrentSessionContext refresh', e);
    } finally {
      setIsLoading(false);
    }
  }, [token, user, setCurrentSession]);

  return (
    <CurrentSessionContext.Provider
      value={{ currentSession, isLoading, refresh, setCurrentSession }}
    >
      {children}
    </CurrentSessionContext.Provider>
  );
}

export function useCurrentSession() {
  const ctx = useContext(CurrentSessionContext);
  if (!ctx) {
    throw new Error(
      'useCurrentSession doit etre utilise a l\'interieur d\'un CurrentSessionProvider'
    );
  }
  return ctx;
}
