import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createCommunity, getCommunities } from '@/lib/api/community';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET() {
  try {
    const client = await getAdminClient();
    const communities = await getCommunities(client);
    return NextResponse.json({ success: true, communities });
  } catch (e) {
    return respondToAuthError(e, 'Failed to load communities');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const community = await createCommunity(client, body);
    return NextResponse.json({ success: true, community }, { status: 201 });
  } catch (e) {
    return respondToAuthError(e, 'Failed to create community');
  }
}
