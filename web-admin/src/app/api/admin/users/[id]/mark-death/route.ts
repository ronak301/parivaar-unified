import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { markDeath } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const body = await request.json();
    const user = await markDeath(client, id, body);
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return respondToAuthError(e, 'Failed to mark death');
  }
}
