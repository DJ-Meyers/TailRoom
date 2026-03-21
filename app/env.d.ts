/// <reference types="vite-plugin-svgr/client" />

interface Window {
  Clerk?: {
    session?: {
      getToken(): Promise<string | null>;
    };
  };
}
