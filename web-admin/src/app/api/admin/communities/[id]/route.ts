import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getCommunity, updateCommunity } from '@/lib/api/community';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const community = await getCommunity(client, id);
    return NextResponse.json({ success: true, community });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load community';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const community = await updateCommunity(client, id, body);
    return NextResponse.json({ success: true, community });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update community';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
