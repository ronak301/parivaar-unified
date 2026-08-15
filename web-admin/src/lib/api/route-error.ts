import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function respondToAuthError(error: unknown, fallbackMessage: string) {
  const status = (error as { status?: number } | undefined)?.status;
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (status === 401) {
    await clearSessionCookie();
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  return NextResponse.json({ error: message }, { status: 502 });
}
