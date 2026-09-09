import { NextRequest, NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> },
) {
  const { communityId } = await params;
  try {
    const client = await getMemberClient();
    const res = await client.get(`/businesses/categories/community/${communityId}`);
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch business categories');
  }
}
