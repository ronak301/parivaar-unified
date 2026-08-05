/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  /** Optional override for API + media base (e.g. `https://api.parivaarapp.in`). */
  readonly VITE_API_BASE_URL?: string;
  /** When `"true"`, allows dev OTP bypass rules (production should omit or set false). */
  readonly VITE_ALLOW_OTP_BYPASS?: string;
  /** Optional override for dev OTP bypass member id. */
  readonly VITE_DEV_OTP_BYPASS_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
