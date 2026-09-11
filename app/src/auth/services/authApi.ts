import { User } from '../types';
import { API_BASE, DEV_MODE_MOCK_DATA } from '../../config';
import * as mockData from '../../mockData';
import { graphqlRequest } from '../../shared/services/graphqlClient';

export interface VerifyCodeResponse {
  token: string;
  user: User;
}

const USER_FIELDS = `
  id
  lastname
  firstname
  phone
  email
  created_at
  updated_at
  status
  preferences
`;

export const authApi = {
  // Declenche l'envoi du code de validation par email - futur serveur Node
  // d'auth, pas Hasura (rien a voir avec les donnees metier).
  async requestCode(email: string): Promise<void> {
    if (DEV_MODE_MOCK_DATA) {
      return;
    }
    const res = await fetch(`${API_BASE}/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Impossible d'envoyer le code de validation");
  },

  // Verifie le code recu par email et renvoie le token de session + l'utilisateur
  // - futur serveur Node d'auth, pas Hasura.
  async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
    if (DEV_MODE_MOCK_DATA) {
      const user = mockData.users.find(u => u.email === email);
      if (!user) throw new Error('Code invalide ou expire');
      return { token: 'dummy', user };
    }
    const res = await fetch(`${API_BASE}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) throw new Error('Code invalide ou expire');
    return res.json();
  },

  // Recharge l'utilisateur courant a partir d'un token stocke (au demarrage de
  // l'app) - cette fois c'est bien Hasura : "qui suis-je" est une donnee
  // utilisateur comme une autre, pas une preoccupation du serveur d'auth une
  // fois le token emis. On ne connait pas encore notre propre id a ce stade
  // (juste le token) : meme pattern permission-filter que profileApi (where
  // toujours vrai, restriction reelle via X-Hasura-User-Id cote permissions).
  async fetchCurrentUser(token: string): Promise<User> {
    if (DEV_MODE_MOCK_DATA) {
      return mockData.users[0];
    }
    /* LATER mv version REST
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session expiree ou invalide');
    return res.json();
    */

    const data = await graphqlRequest<{ user: User[] }>(
      `query Me {
        user(where: { id: { _is_null: false } }, limit: 1) { ${USER_FIELDS} }
      }`,
      undefined,
      token
    );
    if (!data.user[0]) throw new Error('Session expiree ou invalide');
    return data.user[0];
  },
};
