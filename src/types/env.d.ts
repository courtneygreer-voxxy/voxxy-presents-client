/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENVIRONMENT?: 'development' | 'staging' | 'production';
  readonly VITE_MIXPANEL_TOKEN?: string;
  /** Google Maps Embed API (optional; restricts embed by HTTP referrer in GCP). */
  readonly VITE_GOOGLE_MAPS_EMBED_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}