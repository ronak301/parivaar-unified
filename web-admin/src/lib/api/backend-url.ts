export function getBackendUrl(): string {
  // Server-only var (no NEXT_PUBLIC_ prefix — never read from the browser).
  // Falls back to the legacy public var for existing deploy configs.
  // Production defaults to the Caddy host: Netlify doesn't reliably expose
  // netlify.toml env to the build or to Functions at runtime.
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://api.parivaarapp.in' : 'http://localhost:3001')
  );
}
