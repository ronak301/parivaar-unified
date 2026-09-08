import { createAuthenticatedClient } from '@/lib/api/client';
import { getMemberSessionToken } from '@/lib/auth/member-session';

export async function getMemberClient() {
  const token = await getMemberSessionToken();
  return createAuthenticatedClient(token ?? '');
}
