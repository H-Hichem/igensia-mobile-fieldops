import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant (voir .env.example) - doit faire au moins 32 caracteres');
}

// Meme URL que HASURA_GRAPHQL_JWT_SECRET.key configure sur le conteneur Hasura
const HASURA_URL = process.env.HASURA_GRAPHQL_URL ?? 'http://hasura:8080/v1/graphql';

// Optionnel, et DECONSEILLE en usage normal : si defini, ce secret est envoye
// a Hasura sur CHAQUE requete proxifiee, ce qui bascule Hasura en role admin
// et neutralise tout le filtrage par utilisateur (X-Hasura-User-Id) dont
// dependent les requetes GraphQL cote app (voir fieldops/services/*.graphql.ts,
// pattern "where: { id: { _is_null: false } }"). A n'activer qu'en dev et
// comme echappatoire temporaire si l'authentification par JWT pose probleme
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
// par défaut assez haut pour ne pas poser problème en dev,
// l'appareil photo étant limité à 10% qualité :
const BODY_SIZE_LIMIT = process.env.BODY_SIZE_LIMIT || '1mb'; // '1OOkb'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Codes de validation en memoire : suffisant pour l'exercice (un redemarrage
// du serveur invalide les codes en attente, sans consequence grave - il
// suffit d'en redemander un). Une vraie implementation les stockerait en base
// ou dans un cache partage (Redis) pour tenir plusieurs instances du serveur.
const pendingCodes = new Map(); // email -> { code, expiresAt }
const CODE_TTL_MS = 10 * 60 * 1000;

var corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'https://app.localhost',
};
console.log("corsOptions", JSON.stringify(corsOptions, null, 2));

const app = express();
app.use(cors(corsOptions));
app.use(express.json({limit: BODY_SIZE_LIMIT}));
// sinon erreur https://stackoverflow.com/questions/59485258/getting-error-payloadtoolargeerror-request-entity-too-large-in-case-of-using-ex


// ---------------------------------------------------------------
// Authentification sans mot de passe (email + code)
// ---------------------------------------------------------------

app.post('/auth/request-code', async (req, res) => {
  const { email: rawEmail } = req.body ?? {};
  const email = rawEmail?.toLowerCase();
  console.log('/auth/request-code', email, req.body);//
  if (!email) return res.status(400).json({ error: 'email requis' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingCodes.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS });

  // TODO LATER : envoyer un vrai email (Maildev en dev, un vrai provider en
  // prod) - pour l'exercice, le code est juste journalise cote serveur.
  console.log(`[DEV] Code pour ${email} : ${code}`);
  res.status(204).end();
});

app.post('/auth/verify-code', async (req, res) => {
  const { email: rawEmail, code } = req.body ?? {};
  const email = rawEmail?.toLowerCase();
  const entry = pendingCodes.get(email);
  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Code invalide ou expire' });
  }
  pendingCodes.delete(email);

  let user;
  try {
    let { rows } = await pool.query('SELECT * FROM public.user WHERE email = $1', [email]);
    user = rows[0];
    if (!user) {
      ({ rows } = await pool.query(
        `INSERT INTO public.user (email, firstname, lastname) VALUES ($1, NULL, NULL) RETURNING *`,
        [email]
      ));
      user = rows[0];
    }
  } catch (err) {
    console.error('Erreur DB dans /auth/verify-code :', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  // Format de claims que Hasura attend nativement (voir doc Hasura JWT auth) -
  // aucune config Hasura specifique a notre appli a prevoir au-dela du secret
  // partage.
  const token = jwt.sign(
    {
      sub: user.id,
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': user.id,
      },
    },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      lastname: user.lastname,
      firstname: user.firstname,
      phone: user.phone,
    },
  });
});


// ---------------------------------------------------------------
// Proxy GraphQL vers Hasura
// ---------------------------------------------------------------
// L'app ne connait qu'une seule URL (voir config.ts cote app, API_BASE) : cet
// endpoint relaie tel quel vers Hasura, en propageant l'Authorization (le JWT
// emis ci-dessus) que Hasura decode lui-meme via HASURA_GRAPHQL_JWT_SECRET.
app.post('/graphql', async (req, res) => {
  try {
    const hasuraRes = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        ...(HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {}),
      },
      body: JSON.stringify(req.body),
    });

    const data = await hasuraRes.json();
    res.status(hasuraRes.status).json(data);
  } catch (err) {
    console.error('Erreur proxy GraphQL :', err);
    res.status(502).json({ errors: [{ message: 'Hasura injoignable' }] });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`fieldops api sur : ${PORT}`));
