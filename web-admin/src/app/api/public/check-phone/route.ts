import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

// Public, unauthenticated proxy — forwards to the backend's own public
// check-phone endpoint, which does its own validation and rate limiting.
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${getBackendUrl()}/api/users/check-phone-public?phone=${encodeURIComponent(phone)}`,
      { signal: AbortSignal.timeout(10000) },
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Public check-phone proxy error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
