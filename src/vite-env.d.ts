/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTO_LOGIN_DEV: string
  readonly VITE_LOGIN_USERNAME: string
  readonly VITE_LOGIN_PASSWORD: string
  readonly VITE_GIT_REPO_URL: string
  readonly VITE_NSFW: string
}

declare module 'typeface-roboto' {
  const classes: CSSModuleClasses
  export default classes
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __COMIT_HASH__: string
