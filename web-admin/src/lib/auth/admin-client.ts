import { createAuthenticatedClient } from '@/lib/api/client';
import { getSessionToken } from '@/lib/auth/session';

export async function getAdminClient() {
  const token = await getSessionToken();
  return createAuthenticatedClient(token ?? '');
}
