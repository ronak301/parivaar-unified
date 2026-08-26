import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city') ?? '';
  const communityId = request.nextUrl.searchParams.get('communityId');

  try {
    const backendUrl = getBackendUrl();
    const params = new URLSearchParams({ city });
    if (communityId) {
      params.set('excludeCommunityId', communityId);
    }

    const response = await fetch(`${backendUrl}/api/localities/suggest?${params.toString()}`, {
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error ?? 'Failed to fetch locality suggestions' },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, suggestions: data.suggestions });
  } catch (e) {
    console.error('Failed to fetch locality suggestions:', e);
    return NextResponse.json(
      { error: 'Failed to fetch locality suggestions' },
      { status: 500 },
    );
  }
}
