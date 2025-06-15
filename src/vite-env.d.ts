/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTO_LOGIN_DEV: string;
  readonly VITE_LOGIN_USERNAME: string;
  readonly VITE_LOGIN_PASSWORD: string;
  readonly VITE_NSFW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __COMIT_HASH__: string;
