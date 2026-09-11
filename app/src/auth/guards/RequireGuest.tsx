import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

// Enveloppe un ecran de connexion : redirige vers la racine si deja connecte.
export function RequireGuest({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return null;
  ///if (user) return <Navigate to="/" replace />; // else successful login / code verify redirects to / and displays empty page

  return <>{children}</>;
}
