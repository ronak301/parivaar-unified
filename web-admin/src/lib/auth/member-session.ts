import { cookies } from 'next/headers';

const MEMBER_SESSION_COOKIE_NAME = 'member_auth_token';

export async function setMemberSessionCookie(token: string) {
  const store = await cookies();
  store.set(MEMBER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearMemberSessionCookie() {
  const store = await cookies();
  store.delete(MEMBER_SESSION_COOKIE_NAME);
}

export async function getMemberSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(MEMBER_SESSION_COOKIE_NAME)?.value;
}
