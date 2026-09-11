// Requis pour utiliser <capacitor-google-map> en JSX : c'est un web component
// enregistre automatiquement par @capacitor/google-maps, pas un composant React
// que TypeScript connait nativement.
// Voir https://capacitorjs.com/docs/apis/google-maps#react

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'capacitor-google-map': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
