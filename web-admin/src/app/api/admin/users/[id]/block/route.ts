import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { blockUser } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const user = await blockUser(client, id);
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return respondToAuthError(e, 'Failed to block user');
  }
}
