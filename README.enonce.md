# Exercices (TP et TD) Développement mobile avancé


## Exercices 1. Prise en main dev PWA (données mock / "en dur")

Allez dans le dossier app/ et là, faites marcher uniquement l'application mobile en web / PWA (et avec les données "en dur"), en suivant les premières liges de app/README.MD :
    
    npm install -g @ionic/cli
    npm install
    ionic serve
    # => http://localhost:8100
    # et entrez comme login marc.dutoo+jean.dupond@gmail.com ou un autre email
    # d'un utilisateur d'exemple à trouver dans app/src/mockData.ts

## Exercices 6. Prise en main dev Android (données mock / "en dur")

Allez dans le dossier app/ et là, faites marcher l'application sur Android (et avec les données "en dur") :
- installation initiale :

    npm install @capacitor/android
    npx cap add android
    
- build (et après chaque changement de code) :
    
    ionic cap sync
    
- lancez Android Studio, ouvrez-y le nouveau dossier généré .../app/android et attendez la fin du chargement
- connectez votre téléphone en USB à votre ordinateur, passez-le en mode développeur (tapez 7 fois sur le numéro de build dans Paramètres > A propos du téléphone), acceptez la modale d'autorisation
- si il apparaît dans Android Studio dans la liste déroulante des appareils cibles (en haut au milieu), lancez l'application dessus (bouton Play / icône flèche droite)
- si vous n'y arrivez pas, configurez un appareil virtuel (Tools > Device Manager) et lancez l'application de la même manière
- regardez les logs Android (logcat : dans Android Studio, l'icône de chat en bas à gauche)
- débuggez la WebView Android dans Chrome :
  - ouvrez Chrome sur l'URL chrome://inspect/#devices , cliquer sur Configure et rajoutez http://127.0.0.1:9229 s'il n'y est pas déjà, attendez qu'apparaisse une ligne "WebView in io.ionic.starter" et dessous cliquez sur "inspect" jusqu'à ce que la fenêtre s'ouvre - attention, ça peut prendre 10s
  - Là, dans l'onglet Console regardez les logs notamment des composants Capacitor (ex. CapacitorGoogleMaps)
  - et dans l'onglet Sources ouvrez le premier fichier Javascript et cherchez-y (CTRL-F) "createMap" pour y trouver notre code TypeScript de création de la Google Maps.
- GOTCHAs Android Studio :
  - Pas de configuration de Run / pas détecté comme projet Android : vérifier que c'est bien le dossier app/android qui a été choisi, que (npx) ionic cap sync a bien été exécuté dans app/ (puis Files > Reload all from disk), que le projet est "trusted" (ouvrir android/app/src/main/AndroidManifest.xml et si marqué "Untrusted" en haut cliquer à côté sur "trust...")
  - Unsupported Modules Detected : car pas "Trusted", avec la correction précédente normalement cela disparaît, sinon accepter la correction proposée (supprimer les modules KO)
  - Files > Sync project with Gradle Files : à faire ensuite (ou lors d'autres problèmes)
  - Problème de JVM (il faut une JDK 21) : corriger dans File > Settings > Build (...) > Gradle > Gradle JDK

## Exercices 3. Carte (données mock / "en dur")

Allez dans le dossier app/ :
- avec npm, installez le plugin @capacitor/google-maps
- ouvrez (app/)src/fieldops/components/SessionMap.tsx
- rajoutez le code nécessaire sous les TODOs, en vous inspirant du code d'exemple fourni dans le cours (et de la documentation Capacitor liée)
  - TODO code d'affichage du composant JSX Google Maps de capacitor
  - TODO code d'initialisation de Google Maps...
  - TODO rajouter un marqueur sur la même position pour tester, puis le commenter
  - TODO code d'ajoût des markers des observations...
  - TODO TP code de mise à jour du centre de la carte lorsque la propriété center change
(hors données mockées, la carte est centrée sur l'objservation la plus proche de vous,
donc à tester en rajoutant une observation encore plus proche de vous)
  - TODO rajouter au moins un champ optionnel de configuration du Marker, voir https://capacitorjs.com/docs/apis/google-maps#marker
  - TODO TP BONUS écouter les événements de click sur les markers...
  - TODO TP BONUS EXTRA se rappeler des ids des markers rajoutés...
  - TODO TP BONUS EXTRA afficher l'observation correspondante à l'aide de onSelectObservation et observationIdToMarkerIdMap
- Faites marcher sur votre téléphone (ou émulateur) :
  - dans `src/theme/variables.scss`, rajouter à la fin :
(sinon la carte native affichée par Capacitor ne pourra pas être affichée à travers)

```scss
body {
  background: transparent !important;
  background-color: transparent !important;

  // Nesting ion-app inside body to handle both layers at once
  ion-app {
    background: transparent !important;
  }
}
```
  
  - dans `android/app/src/main/AndroidManifest.xml` : sous `<application>`, rajouter `<meta-data android:name="com.google.android.geo.API_KEY" android:value="TODO your API key"/>`
  - `ionic cap sync`
  - dans Android Studio, Files > Reload all files puis relancez l'application sur votre téléphone ou émulateur


## Exercices 4. Géolocalisation (données mock / "en dur")

Allez dans le dossier app/ et faites marcher que la position d'une nouvelle
observation soit la position actuelle, en suivant le cours
(Partie 4. Géolocalisation) :
- avec npm, installez le plugin `@capacitor/geolocation`
- dans le hook (app/)src/shared/hooks/useCurrentPosition.ts , importez-le, appelez-en la bonne fonction
en vous inspirant du code d'exemple fourni dans le cours (et de la documentation Capacitor : 
https://capacitorjs.com/docs/apis/geolocation ),
et convertissez le résultat dans le format attendu en retour du hook `useCurrentPosition`
(regardez la doc Ionic ou mettez un breakpoint JS pour voir ce qui est retourné)
- en PWA (ayant lancé `ionic serve`), créez une nouvelle observation, et
vérifiez que sa position est la position approximative de votre ordinateur
- Faites marcher sur votre téléphone (ou émulateur) :
  - dans `android/app/src/main/AndroidManifest.xml`, rajoutez :
  
      <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-feature android:name="android.hardware.location.gps" />
  
  - `ionic cap sync`
  - dans Android Studio, Files > Reload all files puis relancez l'application sur votre téléphone ou émulateur
  - sur votre téléphone, autorisez la bonne permission en allant dans
Paramètres > Applications > FieldOps > Autorisations, puis créez une nouvelle
observation, et vérifiez que sa position est votre position actuelle.


## Exercices 1. Prise en main dev API serveur

- Retournez dans le dossier racine et faites marcher le serveur tel quel en suivant les premières liges de README.MD, jusqu'à "importer les metadatas" compris. Dans Hasura à http://localhost:8080 :
  - cliquez sur l'onglet Data, dépliez l'arbre des tables dans l'onglet de gauche, cliquez sur la table "observation", afin d'afficher son contenu. Question : combien a-t-elle de lignes ?
  - cliquez sur l'onglet API, à gauche cliquez sur "observation" afin d'avoir une requête REST GraphQL minimale dans l'éditeur au miiieu, puis cliquez sur le bouton Play (icône flèche droite)et observez son résultat à droite. Combien d'observations sont alors retournées ?

- Faites que l'API soit utilisée par l'application en web / PWA :
  - configuez dans app/.env : VITE_DEV_MODE_MOCK_DATA=false
  - (ayant lancé `ionic serve`) vérifiez que la liste des observations s'affiche toujours, et que vous pouvez désormais en créer
  - BONUS EXTRA faire la partie "BONUS Pour localhost https" dans README.md, puis dans app/.env décommentez la ligne VITE_API_BASE_URL=https://api.localhost , puis relancez l'application et vérifiez à nouveau
  - GOTCHA : erreurs réseau du type "GraphQLRequestError: field 'search_closest_observation' not found in type: 'query_root'" => il manque les hasura_metadata.json , à rajouter à http://localhost:8080 > Settings > import

- Faites que l'API soit utilisée par l'application en Android - dans app/README.md , dans la partie "Let app target local dev server", faites le paragraphe "1. alternative http", ainsi :
  - rajoutez dans app/capacitor.config :
  
      android: {
        allowMixedContent: true,
      },
      server: {
        androidScheme: "http",
      },
      
  - dans `android/app/src/main/AndroidManifest.xml`, rajoutez l'attribut `android:usesCleartextTraffic="true"` sur le tag `<application>`, et en fin :
  
      <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
      <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />
      
  - si vous arrivez à connecter votre ordinateur à un réseau où il sera visible à votre téléphone (Igensia SandBox, MAIS PAS partage réseau de téléphone), cherchez son IP locale sur ce réseau avec `ipconfig` (ou sous linux `ifconfig`) et configurez-là dans app/.env (puis `ionic cap sync`) : VITE_API_BASE_URL=http://192.168.0.votre_ip:6868
  - sinon, lancez l'application dans l'émulateur d'Android Studio, après avoir configuré dans app/.env (puis `ionic cap sync`) : VITE_API_BASE_URL=http://10.0.2.2:6868
  - sur le téléphone choisi, autorisez la permission "Appareils à proximité"
en allant dans Paramètres > Applications > FieldOps > Autorisations (sinon
Failed to load resource: net::ERR_LOCAL_NETWORK_PERMISSION_MISSING)
  - vérifiez que la liste des observations s'affiche toujours, et que vous pouvez désormais en créer
  
- BONUS EXTRA ayant fait la partie "BONUS Pour localhost https" dans README.md, dans app/README.md, dans la partie "Let app target local dev server", faites le paragraphe "2. Alternative https avec mkcert local CA mis en app cert" : 
  - suivez-y les instructions pour ajouter le fichier `(app/)android/app/src/main/res/xml/network_security_config.xml` et le fichier `android/app/src/main/res/raw/mkcert_root_ca.pem` qu'il référence
  - dans `android/app/src/main/AndroidManifest.xml`, rajoutez l'attribut `android:networkSecurityConfig="@xml/network_security_config"` sur le tag `<application>`, et en fin :
  
      <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
      <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />
      
  - dans app/.env décommentez la ligne VITE_API_BASE_URL=https://192.168.0.votre_ip (ou VITE_API_BASE_URL=https://10.0.2.2 si vous utilisez l'émulateur Android Studio), (puis `ionic cap sync`) puis dans Android Studio relancez l'application et vérifiez à nouveau
  

## Exercices 7. Offline

En TD, à faire pour Observation (sans photo) ; en TP, à faire pour séance / Session (ou photo) et si possible mutualiser le code.

Lecture :
- Suivre le design pattern "proxy" pour définir un nouvel objet (app/)src/fieldops/services/observationsRepository.tsx (TP : resp. sessionsRepository) qui appelle l'API locale correspondante et expose les mêmes fonctions (partir d'une copie de par exemple observationsApi.graphql.tsx dans le même dossier).
- Se servir de ce observationsRepository dans le (app/)src/shared/services/DataService.tsx à la place de l'API correspondante (TP : resp. sessionsRepository). Tester que tout marche toujours en PWA.
- Dans les fonctions de lecture dans observationsRepository (TP : resp. sessionsRepository), lorsqu'elles réussissent, rafraichir (ou mettre à jour partiellement) un cache local des objets à l'aide de (app/)src/shared/services/localStore.tsx (persisté dans les Preferences Ionic, ex. une clé par type https://ionicframework.com/docs/native/preferences ) :

    await preferencesLocalStore.get<Observation[]>('observations'); // TP : resp. 'sessions'
    await preferencesLocalStore.set<Observation[]>('observations', observations); // TP : resp. 'sessions'

- Dans les fonctions de lecture de observationsRepository :
  - détecter les erreurs au niveau réseau (try catch autour de l'appel),
    - par try catch autour des appels observationsApi, car les appels REST sont réalisés dans observationsApi par Fetch qui ne lève une exception que si le serveur ne renvoie pas de HTTP status ("The fetch() function will reject the promise on some errors, but not if the server responds with an error status", voir https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch )
  - et dans ce cas, retourner plutôt le contenu dudit cache local. Tester sur le téléphone (ex. passer en mode avion).
- Gérez l'initialisation du cache local depuis les Preferences Ionic. Testez avec le redémarrage de l'application.

Ecriture :
- rajoutez une fonction syncAll() à observationsRepository (TP : sessionsRepository). Appelez-là (TP : appelez-les) depuis une fonction syncAll() du DataService.
- appelez DataService.syncAll() depuis un bouton Synchroniser (IonButton onClick) à rajouter dans le Menu dans (app/)src/shared/components/SideMenu.tsx
- utiliser le composant de queue d'outbox (app/)src/shared/services/outbox.tsx et importez-le dans le observationsRepository (TP : sessionsRepository)
- dans le observationsRepository (TP : sessionsRepository) :
  - lors de toute écriture, rajoutez d'abord l'opération correspondante dans ladite file d'outbox (hint : sync_status PENDING).
  - Sur le succès de l'écriture, mettez à jour le sync_status localement et retirez l'opération correpondant de l'outbox le cas échéant.
  - Tester que tout marche toujours en PWA.
- implémentez dataService.syncAll() : pour chaque opération de l'outbox, la réaliser avec le repository approprié. Tester sur le téléphone (ex. passer en mode avion).
- Testez avec le redémarrage de l'application (persistence de l'outbox dans les Preferences Ionic).
- Testez l'idempotence de la création à l'aide d'un timeout (si nécessaire simulé). NB. normalement c'est le cas, grâce à la génération d'un identifiant local, par (window.)crypto.randomUUID() si en HTTPS, sinon ex. https://www.npmjs.com/package/uuid :

    npm install uuid
    import { v4 as uuidv4 } from 'uuid';
    uuidv4(); // ⇨ 'b18794e8-5d0d-417c-b361-ba38e78411b4'

Etat de synchronisation :
- grisez le bouton Synchroniser si l'outbox est vide, tester.
- TP affichez l'état de synchronisation de chaque donnée, soit chaque ligne de sa liste, soit dans son écran de détail (distinguer erreur réseau et métier)
- BONUS imaginez et développez un scénario qui distingue erreur métier vs réseau.

BONUS implémentez le "soft delete" (le bouton Supprimer écrit status = "deleted", les IHMs n'affichent plus les objets ainsi marqués)

BONUS EXTRA : Déclencher automatiquement une synchronisation lorsque le réseau redevient disponible.
- Hint : plugin capacitor Network https://capacitorjs.com/docs/apis/network#addlistenernetworkstatuschange-


## BONUS EXTRA Exercices 9. Android Share Target

1. Identifier le chemin et configurer : À partir du scénario "Partage depuis Google Photos vers FieldOps", identifier :
- identifier l'application émettrice, l'intent, l'action
- identifier le MIME type et l'extra contenant la donnée et en fournir un exemple 
- configurer le AndroidManifest.xml pour ce scenario

2. Ecouter l'Intent : Dans Android Studio,
- faisable en Java ou bien Kotlin (plus élégant MAIS ATTENTION au build : Kotlin a besoin d'être rajouté au projet, suivez les indications de l'IDE, demandez si vous avez des problèmes de build)
- développez (dans un fichier à créer sous les sources) une classe héritant de com.getcapacitor.annotation.CapacitorPlugin contenant du code de traitement d'Intent (hint : surchargez la méthode héritée handleOnNewIntent()) qui écrit un log (hint : Log.d("FieldOps", msg))
- faites connaître ce nouveau plugin de l'application Android / Activity
  - hint : registerPlugin() dans MainActivity.onCreate(), voir https://capacitorjs.com/docs/plugins/tutorial/android-implementation
- qui écrit un log (hint : Log.d("FieldOps", msg)) toutes les informations utiles à en extraire pour le scenario
- redéployez (sur le téléphone !) et testez-la (hint : logcat, ou plus efficace redémarrez en mode Debug et posez des breakpoints dans votre code)

3. La lire : Dans Android Studio,
- enrichissez votre code de traitement d'Intent (hint : surchargez la méthode héritée handleOnNewIntent()) de manière à y lire toutes les informations utiles à en extraire pour le scenario (hint : ContentResolver pour le mimeType, intent.getCharSequenceExtra() pour le EXTRA_TEXT), et loggez-les de même. Exemples :
  - https://developer.android.com/develop/ui/compose/sharing/receive#handling-content
  - https://proandroiddev.com/android-make-your-app-a-share-target-a4c7e81e5a50
- Redéployez (sur le téléphone !) et testez-la.
- Questions :
  - quels sont les 10 premiers caractères de l'URI passée ?
  - Ecrivez le chemin suivant en la partageant plutôt depuis Instagram.

4. BONUS En passer les informations au code TypeScript de l'application :
- dans AndroidStudio, décorez votre classe de l'annotation @CapacitorPlugin(name = "AndroidShareTarget") (sans quoi le plugin ne pourra pas être ciblé depuis TS)
- dans le code TypeScript, définissez definition.ts (l'interface TS avec une unique fonction, qui override une méthode existante si vous l'avez fait hériter de Plugin, ce qui peut être élégant) et index.ts (avec registerPlugin) en vous inspirant du tutorial https://capacitorjs.com/docs/plugins/tutorial/designing-the-plugin-api
- dans App.tsx (à voir où exactement, plusieurs réponses pour l'instant, mais une seule pour les questions suivantes), utilisez ce plugin TypeScript pour y enregistrer un callback TypeScript qui écrit un log. Testez-le sur téléphone (build !) et en PWA. Question : que se passe-t-il en PWA ?
  - hint : https://github.com/ionic-team/capacitor/issues/6234
  - hint :
  
```typescript
AndroidShareTarget.addListener('androidShareTargetEvent', event => {
  // ...
});
```

5. BONUS décrivez et développez la gestion d'au moins 1 cas d'erreur (en Kotlin ou TS)

6. BONUS EXTRA Finalisez la fonctionnalité :
- dans l'app React, installez le plugin capacitor filesystem (voir https://capacitorjs.com/docs/apis/filesystem ), et configurez dans le AndroidManifest.xml l'unique permission nécessaire pour le scenario. Question : laquelle ?
- utilisez-le pour lire le contenu du fichier image partagé dans votre callback. Loggez-le. Testez-le sur téléphone.
  - hint : le seul paramètre path suffit
- completez la fonctionnalité requise par le scenario ! Question : quel est la route cible ?
  - hint : passez les informations nécessaires en paramètre (sous state) de navigation / routage, exploitez-les à l'arrivée dans les initialValues
  
7. BONUS EXTRA - Plusieurs images : Android peut également transmettre plusieurs éléments avec `ACTION_SEND_MULTIPLE`, ainsi que `EXTRA_STREAM` contenant plusieurs `Uri`. Réfléchir à l'évolution de l'architecture vers le partage de plusieurs images.



