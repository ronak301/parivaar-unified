import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/api/auth';

const ADMIN_PHONES = (process.env.ADMIN_PHONES ?? '').split(',').filter(Boolean);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

  if (!phone) {
    return NextResponse.json(
      { error: 'Phone number is required' },
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
    const res = await sendOtp(phone);
    return NextResponse.json({
      success: true,
      verificationId: res.data.verificationId,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 502 },
    );
  }
}
