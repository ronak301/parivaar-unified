import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { updateBusiness } from '@/lib/api/business';
import { respondToAuthError } from '@/lib/api/route-error';

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
    const business = await updateBusiness(client, id, body);
    return NextResponse.json({ success: true, business });
  } catch (e) {
    return respondToAuthError(e, 'Failed to update business');
  }
}
