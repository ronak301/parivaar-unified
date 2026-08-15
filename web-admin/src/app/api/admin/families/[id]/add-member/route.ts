import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { addFamilyMember } from '@/lib/api/family';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(
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
    const user = await addFamilyMember(client, id, body);
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return respondToAuthError(e, 'Failed to add family member');
  }
}
