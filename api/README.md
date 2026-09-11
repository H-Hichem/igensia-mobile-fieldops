# API

Petit serveur Express / node :
- authentification email + code (JWT simule)
- proxy GraphQL vers Hasura, pour que l'app n'ait qu'une seule URL
d'API a connaitre (`API_BASE` cote app, voir `src/config.ts`).


## Quickstart dev

avec docker :

    # start : (in dev listens to changes in src/ !)
    docker compose up -d
    docker compose logs api --tail 500 -f
    # NB. en dev l'app est rebuildée à chaque changement du source qui est monté dans son conteneur
    # mais si l'on veut quand même rebâtir l'image docker : (ex. après rajout de packages npm)
    docker compose up --build --force-recreate -d api
    # (or without logs and from first level : build --no-cache then up -d )
    # remote debugging : open Chrome at chrome://inspect/#devices on 127.0.0.1:9229 (click on Open dedicated DevTools for Node to set it)
    # (works also in preprod, TODO protect)

sans docker :

(with docker should be enough, otherwise harder to make work with admin and app clients)

    # utiliser une version récente de node :
    # (avec nvm pour gérer des versions concurrentes : https://www.nvmnode.com/guide/download.html )
    nvm use v24.2.0
     # build :
    npm install
    # start other components using docker :
    pushd .. ; docker compose up -d traefik postgres hasura ; popd
    # conf with them & run (.env.example has the default props missing from ../.env.dev) :
    cp .env.example .env.dev
    set -a && source .env.dev && source ../.env.dev && set +a && npm run dev
    # PROD : npm run prod
    # => http://localhost:3000


## Routes

- `POST /auth/request-code` — `{ email }` -> 204, code journalise en console
(`[DEV] Code pour ... : ......`).
TODO LATER : vrai envoi d'email (Maildev en dev, un vrai provider en prod).
- `POST /auth/verify-code` — `{ email, code }` -> `{ token, user }`. Cree
l'utilisateur en base s'il n'existe pas encore (lastname/firstname vides,
a completer ensuite).
- `POST /graphql` — relaie tel quel vers Hasura (`HASURA_GRAPHQL_URL`), en
propageant l'en-tete `Authorization`. Matche aussi `/graphql/` (routing
Express non strict par defaut).


## Config requise

- Copier `.env.example` en `.env` et completer `JWT_SECRET` et
 `DATABASE_URL`.
- **Sur le conteneur Hasura**, configurer (les bonnes permissions dans l'IHM et) :

    HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"<meme valeur que JWT_SECRET>"}
    
Sinon Hasura n'acceptera pas les tokens emis par ce serveur.
