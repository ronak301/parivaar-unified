import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/check-phone?phone=${encodeURIComponent(phone)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: 'Check failed', exists: false }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to check phone';
    console.error('[check-phone]', error, { phone });
    return NextResponse.json({ error, exists: false }, { status: 200 });
  }
}
