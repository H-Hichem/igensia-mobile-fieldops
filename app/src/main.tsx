import { createRoot } from 'react-dom/client';
import App from './app/App';

const container = document.getElementById('root');
const root = createRoot(container!);
// NB. React.StrictMode est être retiré volontairement, car même en supprimant
// le code qui est trop à problème (ex. plus d'IonRouterOutlet), la page des
// observations / SessionMap et surtout sa carte ne s'affiche pas.
// 
// En effet, Ionic ne gere pas encore tres
// bien le double-montage qu'il impose en dev (voir le commentaire dans le
// code source d'ionic/react-router : "React 18 will unmount and remount
// IonPage elements in development mode... This can cause duplicate page
// transitions to occur"). Chez nous, ca se traduisait par des pages bloquees
// avec la classe ion-page-invisible jamais retiree (contenu present dans le
// DOM mais invisible), en particulier juste apres une redirection (nos
// RequireAuth/RequireGuest) - un symptome documente par la communaute Ionic
// avec ce meme genre de composants de garde. Aucun impact en production
// (StrictMode n'a d'effet qu'en dev) ; a reactiver ponctuellement si besoin
// de detecter des effets de bord non idempotents ailleurs dans le code.
root.render(
    <App />
);
