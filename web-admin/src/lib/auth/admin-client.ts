import { createAuthenticatedClient } from '@/lib/api/client';
import { getSessionToken } from '@/lib/auth/session';

export async function getAdminClient() {
  const token = await getSessionToken();
  // In dev, allow unauthenticated access by passing empty token
  // Backend will skip auth in dev mode
  return createAuthenticatedClient(token || 'dev-token');
}
