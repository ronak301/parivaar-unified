import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password required' }, { status: 400 });
    }

    const res = await fetch(`${getBackendUrl()}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return NextResponse.json(
        { error: data.error || 'Invalid credentials' },
        { status: res.status },
      );
    }

    const store = await cookies();
    store.set('auth_token', data.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ success: true, token: data.token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
