import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { deleteCommunity, getCommunity, updateCommunity } from '@/lib/api/community';
import { respondToAuthError } from '@/lib/api/route-error';

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
    return respondToAuthError(e, 'Failed to load community');
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
    return respondToAuthError(e, 'Failed to update community');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    await deleteCommunity(client, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return respondToAuthError(e, 'Failed to delete community');
  }
}
