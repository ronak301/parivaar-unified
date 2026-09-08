import { NextResponse } from 'next/server';
import { clearMemberSessionCookie } from '@/lib/auth/member-session';

export async function respondToMemberAuthError(error: unknown, fallbackMessage: string) {
  const { status, details } = (error as { status?: number; details?: unknown } | undefined) ?? {};
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (status === 401) {
    await clearMemberSessionCookie();
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  // Backend client errors (validation, conflict, forbidden) pass through with
  // their details so the UI can show a specific message. Others stay generic.
  if (status && status >= 400 && status < 500) {
    return NextResponse.json({ error: message, details: details ?? undefined }, { status });
  }

  return NextResponse.json({ error: message }, { status: 502 });
}
