import { NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

/** The logged-in member's own feed submissions with their approval status. */
export async function GET() {
  try {
    const client = await getMemberClient();
    const res = await client.get('/feed/me/submissions');
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch submissions');
  }
}
