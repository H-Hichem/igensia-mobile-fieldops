# Front - Application mobile

**ATTENTION COMMENCER ICI** plutôt que dans ./README.md

Facilités de développement : au début données mockées "en dur", séances
désactivées


## Quickstart dev

Sans docker :

    cp .env.example .env
    # utiliser une version récente de node :
    # (avec nvm pour gérer des versions concurrentes : https://www.nvmnode.com/guide/download.html )
    nvm use v24.2.0
    npm install -g @ionic/cli
    # build et lancement en PWA : (le .env local override les défauts PWA / docker)
    npm install
    # (ATTENTION les env vars ont précédence sur .env !)
    ionic serve
    # OU en cas d'erreur "commande ionic n'est pas connue" plutôt : npx ionic serve
    # http://localhost:8100
    # et entrez comme login marc.dutoo+jean.dupond@gmail.com ou un autre email
    # d'un utilisateur d'exemple à trouver dans app/src/mockData.ts

PAR DEFAUT, l'application n'appelle pas l'API mais utilise des données d'exemple "en dur".

GOTCHAs :
- Cannot read properties of null (reading 'edgesOut') => problèmes de compatibilité entre les versions (*) : utiliser node 24, reprendre le build de zéro (supprimer le dossier node_modules voir le fichier package-lock.json) (*) https://github.com/npm/cli/issues/8261

Configuration : dans .env,

    # Google API key :
    VITE_GOOGLE_MAPS_API_KEY=différent selon PWA, Android ou iOS (création : chercher "VITE_GOOGLE_MAPS_API_KEY" plus bas)
    
    # Désactiver les données "en dur" et activer l'appel de l'API locale :
    # (requiert avoir démarré le serveur : docker compose up -d dans le dossier racine)
    VITE_DEV_MODE_MOCK_DATA=false
    
    # Configurer l'API :
    
    # a. (par défaut) Si l'app est démarrée par ionic serve ou sur l'émulateur Android Studio :
    VITE_API_BASE_URL=https://localhost:6868
    # BONUS EXTRA pour que l'app cible cible plutôt l'URL https utilisant le certificat généré par mkcert :
    VITE_API_BASE_URL=https://api.localhost
    
    # b. Si l'app est déployée sur un vrai téléphone :
    # (l'IP doit être visible sur le réseau donc pas par partage de réseau mobile)
    # (sinon déployer sur l'émulateur d'Android Studio)
    VITE_API_BASE_URL=192.168.votre ip locale à trouver avec ipconfig ou ifconfig
    
    # PLUS TARD Activer la fonctionnalité des séances pour le TP :
    #SESSIONS_ENABLED=true

Android - Build (prod, même sans --prod !) et sync + lancement Android Studio (et sa conf si requis) :

    export CAPACITOR_ANDROID_STUDIO_PATH=/snap/bin/android-studio
    ionic capacitor build android
    # (ou aussi) :
    ionic cap sync
    # (ou séparément, pour passer des paramètres de build :)
    #npm run build -- --mode development # NE SUFFIT PAS à ne pas minifier en react / ionic
    #npx cap sync
    #npx cap open android

iOS - Build et sync + lancement XCode :

    # (comprend la synchronisation du code (prod) vers les dossiers des plateformes mobiles natives ex. android/ , qui peut après être utilisé Android Studio pour simuler, déployer sur un device ou builder)
    ionic capacitor build ios

Avec docker (obligatoirement en PWA) : aller dans ../ et comme dit dans son README.md,

    docker compose up
    # NB. l'app est rebuildée à chaque changement du source qui est monté dans son conteneur
    # mais si l'on veut quand même rebâtir l'image docker : (ex. après rajout de packages npm)
    docker compose up --build --force-recreate app -d

GOTCHAs Android Studio :
- Pas de configuration de Run / pas détecté comme projet Android : vérifier que c'est bien le dossier app/android qui a été choisi, que (npx) ionic cap sync a bien été exécuté dans app/ (puis Files > Reload all from disk), que le projet est "trusted" (ouvrir android/app/src/main/AndroidManifest.xml et si marqué "Untrusted" en haut cliquer à côté sur "trust...")
- Unsupported Modules Detected : car pas "Trusted", avec la correction précédente normalement cela disparaît, sinon accepter la correction proposée (supprimer les modules KO)
- Files > Sync project with Gradle Files : à faire ensuite (ou lors d'autres problèmes)
- Problème de JVM (il faut une JDK 21) : corriger dans File > Settings > Build (...) > Gradle > Gradle JDK

### Debug ionic js within android device :

(as in https://stackoverflow.com/questions/38744809/ionic-2-how-can-i-get-console-messages-from-android-device )
run on physical device :
- enable developer mode and USB debugging (look up in Google for your phone model)
- plug phone to usb, select "PTP", accept authorization
- the first time, grab its first 4 digits then use them and check as follows :

    lsusb
    # => 13d3
    echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="13d3", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android-usb.rules
    adb devices
    # => xxx        device

Finally open a Chrome browse at chrome://inspect/#devices , find "WebView in com.fieldops" line
and click on inspect or if required on "inspect fallback"

### Let app target local dev server : (not in prod !)

    # Trouvez l'addresse IP(v4) de votre machine sur un réseau wifi local où elle est visible (donc PAS un partage réseau de téléphone) :
    ipconfig # windows
    ifconfig # linux
    => 192.168.0.111
    # mettez-là aussi dans votre certificat mkcert (voir ../README.md)
    
    # 1. alternative http :
    écrivez l'IP dans .env : (local server ports as in ../.env.dev)
    vi .env
    VITE_API_BASE_URL=http://192.168.0.111:6868
    AndroidManifest.xml : (sinon erreur ERR_CLEARTEXT_NOT_PERMITTED)
    <application
            android:usesCleartextTraffic="true"
    <!-- Required for local network access/IP discovery on Android 16+ :
    https://developer.android.com/privacy-and-security/local-network-permission
    (to enable them manually : in Settings > Applications > your app > Permissions > Denied > Nearby devices > Allow) -->
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
    <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />
    vi app/capacitor.config
      android: {
        allowMixedContent: true,
      },
      server: {
        androidScheme: "http",
      },
    (as at https://stackoverflow.com/questions/76325184/title-mixed-content-error-when-launching-ionic-application-in-android-studio )
    
    # 2. Alternative https avec mkcert local CA mis en app cert :
    # écrivez l'IP dans .env :
    vi .env
    VITE_API_BASE_URL=https://192.168.0.111
    mkcert -CAROOT
    ~/.local/share/mkcert
    # et la mettre en cert de confiance de l'app et donc de sa WebView Chrome :
    cp ~/.local/share/mkcert/rootCA.pem android/app/src/main/res/raw/mkcert_root_ca.pem
    AndroidManifest.xml :
    <application
            android:networkSecurityConfig="@xml/network_security_config"
            ...
    <!-- Required for local network access/IP discovery on Android 16+ :
    https://developer.android.com/privacy-and-security/local-network-permission
    (to enable them manually : in Settings > Applications > your app > Permissions > Denied > Nearby devices > Allow) -->
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
    <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />
    vi app/android/app/src/main/res/xml/network_security_config.xml
    <network-security-config>
        <domain-config>
            <!-- votre IP (servant https) : -->
            <domain includeSubdomains="true">192.168.0.111</domain>
            <trust-anchors>
                <certificates src="@raw/mkcert_root_ca" />
                <certificates src="system" />
            </trust-anchors>
        </domain-config>
    </network-security-config>
    
    # GOTCHA :
    2026-09-04 21:38:02.884  9302-9388  chromium                io.ionic.starter                     E  [ERROR:net/socket/ssl_client_socket_impl.cc:962] handshake failed; returned -1, SSL error code 1, net_error -200
2026-09-04 21:38:02.885  9302-9388  chromium                io.ionic.starter                     E  [ERROR:net/socket/ssl_client_socket_impl.cc:962] handshake failed; returned -1, SSL error code 1, net_error -200
    => Android’s system WebView entirely ignores <debug-overrides> for network requests made inside the Web layer.
  
### FAQ / Gotchas :

- Android Studio does not see device anymore after some time :
  - in the device's Developer options > Debugging, select "Revoke USB debugging authorizations", then reconnect the USB cable, as at https://stackoverflow.com/a/76446978
  - sometimes the Authorize USB device modal only appeats after 10-20s
- l'éditeur ex. du AndroidManifest.xml affiche en haut à gauche "Safe mode, limited functionality" : à sa droite cliquer sur Trust project...
- Compilation is not supported for the following modules: untrusted. Unfortunately, you can't have non-Gradle Java modules and Android-Gradle modules in one project. If you didn't add those intentionally, consider removing them by selecting the option below => redémarrer le Studio (sinon voir Internet)


## Développement

### Configurer les Google API Keys

Besoin : La clé Google à fournir à l'app mobile doit avoir d'activées une des API Maps et la "Geocoding API"
(la seconde est utilisée par `useReverseGeocode`, en appel REST direct, pas via le SDK JS).

Voici comment faire :

Créer son projet "FieldOps Votre Nom" dans https://console.cloud.google.com/

Et là https://console.cloud.google.com/welcome?project=fieldops-1... :

APIs & services > "+ Enable APIs and services" :
- Maps SDK for Android > Enable
- Maps SDK for iOS > Enable
- Maps JavaScript API > Enable (incl. geocoding)

APIs & services > Credentials > "+ Create credentials" > API key :
- Maps JavaScript, Maps JavaScript API, websites, *.fieldops.com, (*.preprod.fieldops.com), *.localhost, localhost:5173/*, localhost:5174/*, localhost:8100/* localhost:8101/*
- Maps Android, Maps SDK for Android, Android apps, ATTENTION sans package car sans SHA (le build de chaque étudiant en ayant des différents ?)
- Maps iOS, Maps SDK for iOS, iOS apps, BundleID: com.fieldops (?)

Et y valoriser VITE_GOOGLE_MAPS_API_KEY dans le .env du présent dossier (app/).

### Recréer le projet Ionic "from scratch" :

    # utiliser une version récente de node :
    # (avec nvm pour gérer des versions concurrentes : https://www.nvmnode.com/guide/download.html )
    cd ..
    nvm use v24.2.0
    npm install -D @ionic/cli native-run
    ionic start fieldops blank --type=react
    mv fieldops app
    cd app/
    
    # (déjà présents dans un projet Ionic React standard)
    #npm i @ionic/react @ionic/react-router react-router-dom ionicons
    npm install -D sass
    # plugins capacitor (pour les capacités natives) :
    npm install @capacitor/preferences
    # au-delà de l'app fournie en début de cours :
    npm install @capacitor/google-maps @capacitor/geolocation
    # photo (& gallery), fichier, batterie etc. :
    npm install @capacitor/camera @capawesome/capacitor-file-picker @capacitor/device


## Usage

### Utilisateurs de test

voir postgres/.../app/test_data.sql


## Development

### Architecture

architecture organisée par domaine
(app/, auth/, sessions/, observations/, profile/, shared/, theme/)
Attention : App.tsx est sous src/app/, et non classiquement sous src/

### Migrate to the next Ionic Capacitor and Android SDK apiLevel :

from https://capacitorjs.com/docs/updating/6-0 :

    npm install -D @capacitor/cli@latest
    npx cap migrate

### Release

- in android/app/build.gradle increase versionCode & versionName, TODO LATER & version name in home / splash screen

https://ionicframework.com/docs/deployment/play-store
To create an AAB binary (bundle) locally using Android Studio:
- Open the Build menu
- Choose Generate Signed Bundle / APK
- Follow the prompts to sign the AAB with the keystore file (choose it in source, pass in Psono)
- Choose 'release' variant

- build & test on device
- in Google Play Console, upload the signed .aab bundle, fill release info (and email them to users or else the customer), and publish the new version
- (& see ../README.md : commit, then merge develop in master)

### Development notes - setup foundations

    # GraphQL (Apollo) client :
    # as at https://www.apollographql.com/docs/react/get-started
    npm install @apollo/client graphql
    # TODO LATER IF NEEDED for realtime subscriptions : ("newer protocol" but already same dep in my personal project)
    # as at https://www.apollographql.com/docs/react/api/link/apollo-link-subscriptions
    #npm install graphql-ws

### Google Maps

Définition des API keys :

https://console.cloud.google.com/google/maps-apis/credentials?authuser=1&project=fieldops-1
(ou choisir FieldOps)

puis Clés / Keys : là en sélectionner (ou rajouter), et renseigner :
- pour chacune : Application restrictions, resp. Websites, Android apps, iOS apps
- si Websites, Website restrictions : *.preprod.fieldops.com/*  
*.fieldops.fr/* localhost:5173/* localhost:5174/* localhost:8100/* localhost:8101/*
- si Android, Android restrictions : package com.fieldops, signatures SHA1 à prendre (de l'IHM Google Play Console si elle produit elle-même un .aab au lieu d'un .apk) de :

    # . apk buildé par Android Studio
    keytool -list -v -keystore ./android_keystore.jks -alias fieldops
    # et idem des default debug keystore de chaque dev :
    # ~mdutoo/.android/debug.keystore => 0E:...:5B
    # cas du .aab buildé par Google Play Console : trouver la signature SHA1 dans son IHM web
