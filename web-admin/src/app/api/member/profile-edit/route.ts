import { NextRequest, NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

/** Latest profile-edit approval request for the logged-in member. */
export async function GET() {
  try {
    const client = await getMemberClient();
    const res = await client.get('/users/me/profile-edit');
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch edit status');
  }
}

/** Submit proposed profile changes (requires actionToken from OTP re-verification). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  try {
    const client = await getMemberClient();
    const res = await client.post('/users/me/profile-edit', body);
    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to submit changes');
  }
}
