import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createUser } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const user = await createUser(client, body);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (e) {
    return respondToAuthError(e, 'Failed to create user');
  }
}
