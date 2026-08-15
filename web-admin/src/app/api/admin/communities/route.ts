import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createCommunity } from '@/lib/api/community';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET() {
  try {
    const response = await fetch('http://localhost:3001/api/communities', {
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, communities: data.communities });
  } catch (e) {
    console.error('Failed to fetch communities:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load communities' },
      { status: 500 }
    );
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
