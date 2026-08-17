import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId') || '';
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const url = new URL(`${backendUrl}/api/users/community/${communityId}`);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);

    if (query) {
      // Use search endpoint if query provided
      const searchUrl = new URL(`${backendUrl}/api/users/search`);
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('communityId', communityId);
      searchUrl.searchParams.set('page', page);
      searchUrl.searchParams.set('limit', limit);

      const res = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch members' },
          { status: res.status }
        );
      }

      return NextResponse.json(await res.json());
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
