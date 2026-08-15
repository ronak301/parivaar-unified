import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createBusiness } from '@/lib/api/business';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const business = await createBusiness(client, body);
    return NextResponse.json({ success: true, business }, { status: 201 });
  } catch (e) {
    return respondToAuthError(e, 'Failed to create business');
  }
}
