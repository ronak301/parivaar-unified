export function getBackendUrl(): string {
  // Server-side: use private env var first, then public, then localhost
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
}
