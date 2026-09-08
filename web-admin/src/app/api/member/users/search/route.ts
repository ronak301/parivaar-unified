import { NextRequest, NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

export async function GET(request: NextRequest) {
  try {
    const client = await getMemberClient();
    const { searchParams } = new URL(request.url);
    const res = await client.get('/users/search', {
      params: Object.fromEntries(searchParams.entries()),
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to search members');
  }
}
