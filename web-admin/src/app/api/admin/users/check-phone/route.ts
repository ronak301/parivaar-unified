import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { checkPhone } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const result = await checkPhone(client, phone);
    return NextResponse.json(result);
  } catch (e) {
    return respondToAuthError(e, 'Failed to check phone');
  }
}
