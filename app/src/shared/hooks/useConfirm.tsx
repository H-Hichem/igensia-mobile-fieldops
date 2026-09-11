import { IonAlert } from '@ionic/react';
import { useState, useCallback, ReactElement } from 'react';

interface ConfirmOptions {
  header?: string;
  confirmLabel?: string;
}

interface ConfirmState extends ConfirmOptions {
  message: string;
  resolve: (value: boolean) => void;
}

// confirm(message, options?) renvoie une Promise<boolean> ; le composant <dialog/>
// retourne est a rendre une fois dans l'arbre du composant appelant.
export function useConfirm(): {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  dialog: ReactElement;
} {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, resolve, ...options });
    });
  }, []);

  const dialog = (
    <IonAlert
      isOpen={state !== null}
      header={state?.header ?? 'Confirmer la modification'}
      message={state?.message ?? ''}
      buttons={[
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            state?.resolve(false);
            setState(null);
          },
        },
        {
          text: state?.confirmLabel ?? 'Confirmer',
          handler: () => {
            state?.resolve(true);
            setState(null);
          },
        },
      ]}
      onDidDismiss={() => {
        if (state) {
          state.resolve(false);
          setState(null);
        }
      }}
    />
  );

  return { confirm, dialog };
}
