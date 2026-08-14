import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/api/auth';
import { setSessionCookie } from '@/lib/auth/session';

const ADMIN_PHONES = (process.env.ADMIN_PHONES ?? '').split(',').filter(Boolean);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';
  const verificationId =
    typeof body?.verificationId === 'string' ? body.verificationId : '';

  if (!phone || !otp || !verificationId) {
    return NextResponse.json(
      { error: 'Phone, OTP, and verificationId are required' },
      { status: 400 },
    );
  }

  if (ADMIN_PHONES.length > 0 && !ADMIN_PHONES.includes(phone)) {
    return NextResponse.json(
      { error: 'This phone number is not authorized' },
      { status: 403 },
    );
  }

  try {
    const res = await verifyOtp(phone, otp, verificationId);
    const token = res.data?.token;
    const user = res.data?.user;

    if (!token) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    if (user?.role !== 'super_admin' && user?.role !== 'community_admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 },
      );
    }

    await setSessionCookie(token);
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  }
}
