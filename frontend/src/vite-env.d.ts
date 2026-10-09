/// <reference types="vite/client" />

/**
 * Vite exposes env variables via import.meta.env.
 * Declare custom VITE_ prefixed variables here for TypeScript type safety.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
