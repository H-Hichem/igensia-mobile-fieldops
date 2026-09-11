import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATTERNS } from '../../app/routes';

// Enveloppe un ecran qui necessite d'etre connecte : <Route path="..." element={<RequireAuth><X/></RequireAuth>} />
// (React Router v6 n'accepte plus de composants "a la Route" comme enfants directs de IonRouterOutlet,
// il faut passer par l'element et enveloppe les enfants).
// Pendant l'initialisation, ne rend rien : c'est AppBootstrap (le splash) qui est affiche a la racine.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return null;
  if (!user) return <Navigate to={ROUTE_PATTERNS.loginEmail} replace />;

  return <>{children}</>;
}
