import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Preferences } from '@capacitor/preferences';
import { authApi } from '../services/authApi';
import { User } from '../types';

const TOKEN_KEY = 'fieldops_auth_token';
const USER_KEY = 'fieldops_auth_user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  // true pendant la lecture du token stocke au demarrage (piloté par le splash screen)
  isInitializing: boolean;
  // email en attente de validation par code, entre les deux etapes du login
  pendingEmail: string | null;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Au demarrage : relit le token stocke localement et tente de recharger l'utilisateur.
  // C'est cette verification que le splash screen (AppBootstrap) attend.
  useEffect(() => {
    (async () => {
      const { value: storedToken } = await Preferences.get({ key: TOKEN_KEY });
      if (storedToken) {
        try {
          const currentUser = await authApi.fetchCurrentUser(storedToken);
          await Preferences.set({ key: USER_KEY, value: JSON.stringify(currentUser) });
          setToken(storedToken);
          setUser(currentUser);
          
        } catch (networkError) {
          console.log('AuthContext networkError', networkError);
          // token expire ou invalide : on réutilise le stocké
          const { value } = await Preferences.get({ key: USER_KEY });
          try {
            setToken(storedToken);
            setUser(JSON.parse(value || '') as User);
          } catch {
            // Valeur corrompue/non-JSON, traitée comme absente
            await Preferences.remove({ key: TOKEN_KEY });
            await Preferences.remove({ key: USER_KEY });
          }
          
        }
      }
      setIsInitializing(false);
    })();
  }, []);

  // Etape 1 du login : demande d'envoi du code par email
  const requestCode = useCallback(async (email: string) => {
    await authApi.requestCode(email);
    setPendingEmail(email);
  }, []);

  // Etape 2 du login : verification du code recu
  const verifyCode = useCallback(
    async (code: string) => {
      if (!pendingEmail) {
        throw new Error('Aucune adresse email en attente de verification');
      }
      const { token: newToken, user: newUser } = await authApi.verifyCode(
        pendingEmail,
        code
      );
      await Preferences.set({ key: TOKEN_KEY, value: newToken });
      await Preferences.set({ key: USER_KEY, value: JSON.stringify(newUser) });
      setToken(newToken);
      setUser(newUser);
      setPendingEmail(null);
    },
    [pendingEmail]
  );

  const logout = useCallback(async () => {
    await Preferences.remove({ key: TOKEN_KEY });
    await Preferences.remove({ key: USER_KEY });
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isInitializing,
        pendingEmail,
        requestCode,
        verifyCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise a l\'interieur d\'un AuthProvider');
  return ctx;
}
