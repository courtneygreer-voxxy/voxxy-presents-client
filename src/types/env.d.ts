/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENVIRONMENT?: 'development' | 'staging' | 'production';
  readonly VITE_MIXPANEL_TOKEN?: string;
  readonly VITE_JWT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}