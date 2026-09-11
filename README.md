# FieldOps

**ATTENTION COMMENCER par app/README.md !**
(avec l'application mobile en mode web / PWA et utilisant des données "en dur")


---


App mobile permettant de réaliser des observations environnementales
(déchet, espèce invasive...) à l'aide des capacités natives (GPS, photo...)
regroupées en séance d'observation.

Stack : app en React / Ionic, front web en React / vite, auth JWT / node,
API REST GraphQL par Hasura / Postgres (proxyié aussi par node).

Facilités de développement : au début données mockées "en dur", séances
désactivées

Services externes intégrés :
- (stores mobiles Google et Apple)
- Google Maps, pour cartes des observations et sessions
- Google Geocoding API, pour reverse geocoding séances
- PLUS TARD Mail : expédition par SMTP

Overview :
- Quickstart dev
- IMPORTANT
- FAQ / Gotchas
- Installation

## Quickstart dev

Prérequis : Docker Compose, mkcert, pour le lancement local node.js

Récupération :

    git clone git@github.com:mdutoo/fieldops.git
    git checkout develop
    
Configuration :

    cp .env.dev .env
    cp docker-compose.dev.yml docker-compose.yml
    # OU sous linux ln -fs (ou rajouter -f docker-compose.dev.yml dans toutes les commandes docker compose,
    # ex. docker compose -f docker-compose.dev.yml ps -a)
    # sous linux :
    chmod +x postgres/app/docker-entrypoint-initdb.d/init-database.sh
    
Lancement :
    
    docker compose up -d
    # (ce qui initialise data model et données d'exemple)
    # ET connectez-vous à Hasura à http://localhost:8080
    # après y avoir fourni le mot de passe (chercher HASURA_GRAPHQL_ADMIN_SECRET dans .env.dev)
    # cliquez sur l'onglet Settings et importer les metadatas
    # à trouver à postgres/docker-entrypoint-initdb.d/app/hasura_metadata.json
    
    # lire les codes de login émise lors de tentative de login dans l'app :
    docker logs api -d --tail 100
    
    # logs :
    docker compose logs --tail 500 -f
    # si nécessaire de rebuilder toutes les images :
    docker compose up --build --force-recreate -d
    # pour tout réinitialiser si nécessaire (une fois le tout arrêté) : (ATTENTION supprime les données)
    #docker compose down
    #sudo rm -rf volumes/
    #docker compose up -d
    
=>
- Hasura (API données) : http://localhost:8080
- API (API auth et proxy hasura) : http://localhost:6868
- app web PWA (désactivée, en dev on préfère "ionic serve" manuel dans app/) : http://localhost:8101
- pgadmin (désactivé, Hasura suffit) : http://localhost:8090
- (pas en prod) https://dashboard.localhost/dashboard/#/http/routers http://localhost/dashboard/#/http/routers
    
BONUS Pour localhost https : (sans cela le faux certificat banni traefik.me et sa clé privée sont utilisés par défaut)

    # create your own local (dev) CA using mkcert and trust it, gen localhost dev cert :
    # windows : AU CHOIX WinGet ou Chocolatey
    winget install -e --id FiloSottile.mkcert # https://winget.run/pkg/FiloSottile/mkcert
    choco install mkcert
    # linux : ( libnss3-tools pour certutil sinon cert pas trusté par browsers)
    sudo apt install mkcerts libnss3-tools
    mkcert -install
    # ("*.localhost" does not work though it should)
    # Trouvez l'addresse IP(v4) de votre machine sur un réseau wifi local où elle est visible (donc PAS un partage réseau de téléphone) :
    ipconfig # windows
    ifconfig # linux
    => 192.168.0.votre_ip
    mkcert -cert-file certs/localhost-dev-cert.pem -key-file certs/localhost-dev-key.pem 192.168.0.votre_ip 10.0.2.2 api.localhost app.localhost pgadmin.localhost traefik.localhost hasura.localhost app1.localhost app2.localhost localhost 127.0.0.1 ::1
    # (NE PAS committer ! sinon banni si public ex. sur github)
    
    # réinitialisez le web proxy traefik :
    docker compose down
    docker compose up -d traefik
    
=>
- Hasura (API données) : https://hasura.localhost http://localhost:8080
- API (API auth et proxy hasura) : https://api.localhost http://localhost:6868
- app web PWA (désactivée, en dev on préfère "ionic serve" manuel dans app/) : https://app.localhost http://localhost:8101
- pgadmin (désactivé, Hasura suffit) : https://pgadmin.localhost http://localhost:8090
- (pas en prod) https://dashboard.localhost/dashboard/#/http/routers http://localhost/dashboard/#/http/routers
    
IMPORTANT :
- à sa création, la base app est auto chargée avec des données d'exemple

**FAQ / Gotchas tech** :

- erreurs réseau du type "GraphQLRequestError: field 'search_closest_observation' not found in type: 'query_root'" => il manque les hasura_metadata.json , à rajouter à http://localhost:8080 > Settings > import
- ERROR: for app  'ContainerConfig'
=> docker compose et non docker-compose, voir https://askubuntu.com/questions/1508129/docker-compose-giving-containerconfig-errors-after-update-today
- si traefik ne démarre pas car le port 80 est pris, d'abord arrêter et désactiver le démarrage automatique de tout serveur web (apache2 sur Debian, nginx) :

    sudo systemctl stop apache2
    sudo systemctl disable apache2
    sudo systemctl stop nginx
    sudo systemctl disable nginx

- 20260511 si 404 & dans volumes/traefik/debug.log , Provider connection error Error response from daemon: client version 1.24 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version :
=> passer à Traefik 2.11.31 (au moins) https://github.com/traefik/traefik/issues/12253#issuecomment-3514343651


## Diverses informations

### Traefik

- Configuration globale : https://doc.traefik.io/traefik/providers/docker/
- Configuration du SSL en local : https://yoandev.co/du-https-en-local-avec-docker-traefik-traefik-me-et-lets-encrypt https://gitlab.com/yoandev.co/https-en-local-avec-docker-traefik-traefik.me-et-lets-encrypt
- Configugration du SSL avec certificat(sans lets encrypt) : https://kevinquillen.com/setting-traefik-2-local-ssl-certificate


## Exploitation

### Docker - récupérer de l'espace disque / purge :

    docker system df
    docker system df -v
    docker builder prune -a # usually the biggest, reclaims ex. 40GB !! -a not risky because only cache
    #docker volume prune # BEWARE -a is risky
    docker image prune # reclaims ex. 10GB

    # après avoir démarré tous les conteneurs nécessaires, afin de ne pas supprimer une image nécessaire :
    # davantage :
    docker compose up
    #docker compose down
    docker image prune -a
    docker system df
    docker system df -v

### Node debug conf

LATER :
Utilisation de nodemon pour rédarrer le serveur automatiquement à chaque changement du code, avec --inspect:0.0.0.0 pour permettre le debug https://stackoverflow.com/questions/53352303/how-to-debug-a-nodemon-project-in-vscode https://nodejs.org/en/learn/getting-started/debugging
Dans VSCode : onglet Run and Debug > "create a launch.json file" > select debugger : node NON KO car https://github.com/microsoft/vscode-js-debug/issues/2042

### Docker conf

dev quickstart :
- see api (or media) README
- NB. docker compose (only) recreates a container if its image or docker conf has changed

& see docker-compose.x.yml

environments :
- there is one entirely separate docker compose file per environment, rather than stacking them like the reference project (stacking is great until it makes customizing a single env too hard, error prone and complex to understand).
- BEWARE in docker compose, "environment" takes precedences to ".env" file, so make sure that variables set in ".env" are not in docker-compose.dev.yml containers' "environment"

best practice :
- command in Dockerfile rather than docker-compose.yml https://stackoverflow.com/questions/72284462/cmd-in-dockerfile-vs-command-in-docker-compose-yml

gotchas :
- to avoid shutdown because background process (either one should be enough ? same as -it) :
(most probably, see https://www.handsonarchitect.com/2018/01/docker-compose-tip-how-to-avoid-sql.html
https://stackoverflow.com/questions/70074950/docker-container-not-running-after-docker-compose-up )
    stdin_open: true
    tty: true

testing & debugging docker conf :

see open ports incl. within container :
netstat -a
https://stackoverflow.com/questions/942824/how-to-find-ports-opened-by-process-id-in-linux

enable to allow to start process manually within the container : (when crashes at start)
see https://forums.docker.com/t/how-to-start-a-process-within-a-container-via-dockerfile/108117
command: sleep infinity

traefik gotchas & decisions :
- command / labels vs traefik.yml : pros / cons esp. doc (ex. exposedbydefault label is rather lower case) https://www.reddit.com/r/Traefik/comments/qc2h6e/comment/hhfzvrl , most use file https://www.reddit.com/r/Traefik/comments/ufr9o2/which_configuration_do_you_use_for_traefik/ , can't use both https://community.traefik.io/t/combining-file-and-cli-configurations/1651
- auto / letsencrypt cert : tls.yml is not needed (only if using one's own certificate ) (or at least its props commented), minimal working example : https://doc.traefik.io/traefik/user-guides/docker-compose/acme-tls/


## Préproduction

### Installation

Prerequisites (git & docker) :

    # update :
    sudo apt-get update
    sudo apt-get upgrade
    # set time : else when dev on auth preprod, Hasura might return error "Could not verify JWT: JWTIssuedAtFuture" :
    date
    sudo timedatectl set-timezone Europe/Paris

    # git & github :
    sudo apt-get install git
    #TODO SSH conf key or better token

    # Docker : as at https://docs.docker.com/engine/install/debian/
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl status docker
    #sudo groupadd docker
    sudo usermod -aG docker debian

Install :

    git clone git@github.com:mdutoo/fieldops.git
    sudo mv fieldops/ /opt/
    cd /opt/fieldops
    # in preprod :
    #git checkout develop
    ln -fs docker-compose.preprod.yml docker-compose.yml
    ln -fs .env.preprod .env

Start :

    sudo docker compose up -d
    # (ce qui initialise data model et données d'exemple)
    # et 
    sudo docker compose logs --tail 500 -f
    #sudo docker compose up app --build --force-recreate -d

Post start :
- dans Hasura > Settings ex. à https://hasura.localhost , importer les metadatas
à trouver à postgres/docker-entrypoint-initdb.d/app/hasura_metadata.json

FAQ :
- problème de certificat letsencrypt


## Production

### Mises à jour

(tester en preprod d'abord !)
    
    # Mise à jour OS :
    sudo apt-get update && sudo apt-get upgrade
    
    # Mise à jour Docker :
    docker compose pull
    docker compose up -d --force-recreate

### PostgreSQL - plus :

    # connexion en DB Admin :
    sudo docker compose exec -it postgres psql -U postgres
    
    # postgres logs :
    sudo docker compose logs -f --tail 1000 postgres
    
    # temp. change conf :
    sudo docker compose exec -it postgres /bin/bash
    vi /var/lib/postgresql/data/postgresql.conf
    # log slow statements ex. >1s :
    log_min_duration_statement = 300
    # log ALL statements (NOT ADVISED) :
    log_statement = 'all'
    # reload conf :
    sudo docker compose exec -it postgres psql -U postgres -c 'select pg_reload_conf()'

## Configuration comptes / services externes :

### Google Maps API KEY

https://console.cloud.google.com/google/maps-apis/credentials?project=fieldops-1

    puis Clés / Keys :
    Application restrictions : resp Websites, Android apps, iOS apps
    Android restrictions : package fr.fieldops, SHA1 00:...
    Website restrictions : *.preprod.fielops.com/*   
    *.fieldops.com/* localhost:5173/* localhost:5174/* localhost:8100/* localhost:8101/*


------


# Architecture

## Modèle de données

voir sous postgres/.../ voir :
- **schema.sql** : modèle de données SQL, avec les commentaires des champs
- et des exemples de query GraphQL dans postgres/*/*.md (pas à jour, privilégier src/services/graphql.js sous api/web/app)
- test_data.sql : données de test auto initialisant une base vide (pas à jour, privilégier l'import de jeu de données existant)
- infos d'audit : created_at est renseigné par valeur par défaut, modified_at par trigger
- triggers (dans postgres/.../triggers.sql) :
- views (dans postgres/.../views.sql) :

types de champ :
- dates :
  - format des timestamps : UTC 8601
  

## Hasura FAQ / Gotchas

- error no mutations exist
=> most probably not authentified or not enough rights (or hasura_metadata.json not imported in the Hasura console's Settings tab)

permissions :
- when inserting an object 'x' along with an embedded relationship 'x_y', the relationship remote target object y_id field should have insert permission, else error field 'y_id' not found in type: 'x_y'
- insert preset of (ex. relationship) field if check not enough
- post-update check if merely disallowing updating (ex. relationship) field not enoughd


## When Hasura permissions not enough:

solved using better Hasura visual permission configuration or using more fields (insert patient only for self aidant user)
OR ELSE by custom apis to be developed (share patient, register / create user))


## Hasura

### version choice

v2 vs v3 :
- https://www.reddit.com/r/Hasura/comments/1hxolvt/self_hosting_hasura_v3/
- https://hasura.io/learn/graphql/hasura-v3/introduction/
- v3 Pros : actions can reuse existing DB types ! Workaroun for v2 :
  - https://github.com/hasura/graphql-engine/issues/5001 describes some workarounds for v2 esp. output types, but this is still cumbersome esp. for Apollo client ("cache" ?).
  - or use input validation webhook when possible (), see https://hasura.io/docs/2.0/schema/postgres/input-validations/
  - Or use instead Event Triggers, alas only async contrary to actions https://hasura.io/docs/2.0/api-reference/metadata-api/event-triggers/ (though they use actual PostgreSQL triggers).
  - or at worse postgres trigger https://hasura.io/docs/2.0/schema/postgres/data-validations/*
  - or graphql remote schema BUT have to code GraphQL resolvers (at least for mutations) and find a way to reuse existing DB types like actions all the same
- v3 Cons : too new, hard to self-host, few doc, (therefore) few open source community
- v2 : "actively supported in mission critical environments, if it fits your use case then use it"
=> v2 + actions (plutôt que event triggers)

Enteprise (EE) or Community (CE) :
- https://www.restack.io/docs/hasura-knowledge-hasura-community-edition 
- EE adds : more DBs, observability, read replicas, RBAC (?)
- => CE enough
