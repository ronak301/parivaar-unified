import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? '';
  const communityId = request.nextUrl.searchParams.get('communityId');

  try {
    const client = await getAdminClient();
    const res = await client.get('/localities/suggest', {
      params: { city, ...(communityId ? { excludeCommunityId: communityId } : {}) },
    });
    return NextResponse.json({ success: true, suggestions: res.data.suggestions });
  } catch (e) {
    return respondToAuthError(e, 'Failed to fetch locality suggestions');
  }
}
