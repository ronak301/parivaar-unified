export function getBackendUrl(): string {
  // Server-only var (no NEXT_PUBLIC_ prefix — never read from the browser).
  // Falls back to the legacy public var for existing deploy configs.
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
}
