import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

// POST: set a new random password for the community's admin login; returns it once.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const res = await client.post(`/communities/${id}/admin/regenerate`);
    return NextResponse.json(res.data);
  } catch (e) {
    return respondToAuthError(e, 'Failed to regenerate password');
  }
}
