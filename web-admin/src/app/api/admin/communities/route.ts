import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createCommunity } from '@/lib/api/community';
import { respondToAuthError } from '@/lib/api/route-error';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    console.log('Fetching communities from:', backendUrl);

    const response = await fetch(`${backendUrl}/api/communities`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      // Add mode for CORS
      mode: 'cors',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend error:', response.status, text);
      throw new Error(`Backend returned ${response.status}: ${text}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, communities: data.communities });
  } catch (e) {
    console.error('Failed to fetch communities:', e instanceof Error ? e.message : e);
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
