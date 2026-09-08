import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await getAdminClient();
    const res = await client.post('/auth/admin-generate-otp', body);
    return NextResponse.json(res.data);
  } catch (e) {
    return respondToAuthError(e, 'Failed to generate OTP');
  }
}
