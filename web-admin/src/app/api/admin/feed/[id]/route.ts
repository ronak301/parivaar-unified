import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const res = await client.delete(`/feed/${id}`);
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToAuthError(error, 'Failed to remove feed item');
  }
}
