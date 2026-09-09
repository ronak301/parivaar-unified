import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { changeFamilyHead } from '@/lib/api/family';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const body = await request.json();
    const family = await changeFamilyHead(client, id, body);
    return NextResponse.json({ success: true, family });
  } catch (e) {
    return respondToAuthError(e, 'Failed to change family head');
  }
}
