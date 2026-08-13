import { useCallback, useEffect, useRef } from "react";

type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  prompt: () => void;

  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export const useGoogleAuth = (
  onSuccess: (token: string) => void | Promise<void>,
  onError?: () => void,
) => {
  const callbackRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  useEffect(() => {
    callbackRef.current = onSuccess;
    errorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }, []);

  const loginWithGoogle = useCallback(() => {
    const google = window.google;

    if (!google?.accounts?.id) {
      errorRef.current?.();
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is missing.");
      errorRef.current?.();
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,

      callback: async (response) => {
        if (!response.credential) {
          errorRef.current?.();
          return;
        }

        try {
          await callbackRef.current(response.credential);
        } catch (error) {
          console.error("Google authentication failed:", error);
          errorRef.current?.();
        }
      },
    });

    google.accounts.id.prompt();
  }, []);

  return {
    loginWithGoogle,
  };
};
