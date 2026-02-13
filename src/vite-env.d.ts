/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_TEST_ADMIN_USERNAME?: string
  readonly VITE_TEST_ADMIN_PASSWORD?: string
  readonly VITE_TEST_OWNER_USERNAME?: string
  readonly VITE_TEST_OWNER_PASSWORD?: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
