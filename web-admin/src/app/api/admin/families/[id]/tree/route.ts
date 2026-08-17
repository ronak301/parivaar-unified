import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getFamilyTree } from '@/lib/api/family';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const data = await getFamilyTree(client, id);
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    return respondToAuthError(e, 'Failed to fetch family tree');
  }
}
