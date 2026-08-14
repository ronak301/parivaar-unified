import { createAuthenticatedClient } from '@/lib/api/client';
import { getSessionToken } from '@/lib/auth/session';

export async function getAdminClient() {
  const token = await getSessionToken();
  if (!token) {
    throw new Error('No session token found');
  }
  return createAuthenticatedClient(token);
}
