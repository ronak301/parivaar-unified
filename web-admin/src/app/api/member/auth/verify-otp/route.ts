import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';
import { setMemberSessionCookie } from '@/lib/auth/member-session';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, verificationId } = await request.json();

    if (!phone || !otp || !verificationId) {
      return NextResponse.json({ error: 'Phone, OTP and verificationId are required' }, { status: 400 });
    }

    const res = await fetch(`${getBackendUrl()}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, verificationId }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return NextResponse.json({ error: data.error || 'Invalid OTP' }, { status: res.status });
    }

    await setMemberSessionCookie(data.token);

    return NextResponse.json({ success: true, user: data.user, isNewUser: data.isNewUser });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 },
    );
  }
}
