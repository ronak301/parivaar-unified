import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

// Public, unauthenticated proxy — forwards straight to the backend's own
// public endpoint, which does its own validation and rate limiting.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/approvals/public/submit-family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Public family submit proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
