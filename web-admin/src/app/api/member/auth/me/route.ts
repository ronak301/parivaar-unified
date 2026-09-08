import { NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

export async function GET() {
  try {
    const client = await getMemberClient();
    const { data } = await client.get('/auth/me');
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch profile');
  }
}
