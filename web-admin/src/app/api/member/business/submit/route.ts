import { NextRequest, NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

/** Member-submitted business; created only once an admin approves. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  try {
    const client = await getMemberClient();
    const res = await client.post('/businesses/submit', body);
    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to submit business');
  }
}
