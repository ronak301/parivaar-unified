import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/communities`);

    if (!res.ok) {
      console.error('Failed to fetch communities:', res.status);
      throw new Error(`Communities API error: ${res.status}`);
    }

    const data = await res.json();
    const communities = data.communities ?? [];

    return NextResponse.json({
      success: true,
      user: {
        _id: 'dev-admin-id',
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        role: 'super_admin',
        profilePicture: undefined,
        communities,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auth failed' },
      { status: 500 }
    );
  }
}
