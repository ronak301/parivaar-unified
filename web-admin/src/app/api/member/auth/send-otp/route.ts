import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const checkRes = await fetch(`${getBackendUrl()}/api/auth/check-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const checkData = await checkRes.json();

    if (!checkData.exists) {
      return NextResponse.json(
        { error: 'This phone number is not registered. Please contact your community admin.' },
        { status: 404 },
      );
    }

    const res = await fetch(`${getBackendUrl()}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Failed to send OTP' }, { status: res.status });
    }

    return NextResponse.json({ success: true, verificationId: data.verificationId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 },
    );
  }
}
