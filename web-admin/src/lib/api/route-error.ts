import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function respondToAuthError(error: unknown, fallbackMessage: string) {
  const { status, details } = (error as { status?: number; details?: unknown } | undefined) ?? {};
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (status === 401) {
    await clearSessionCookie();
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  // Backend client errors (validation, not found, forbidden) are passed through
  // with their field-level details so the UI can show a specific message.
  // Anything else stays a generic 502 so internals are not leaked.
  if (status && status >= 400 && status < 500) {
    return NextResponse.json({ error: message, details: details ?? undefined }, { status });
  }

  return NextResponse.json({ error: message }, { status: 502 });
}
