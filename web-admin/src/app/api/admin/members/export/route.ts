import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

const FILTER_KEYS = [
  'gender',
  'bloodGroup',
  'locality',
  'ageMin',
  'ageMax',
  'isMarried',
  'businessCategory',
  'isFamilyHead',
] as const;

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

// Returns every member matching the current search + filters (not paginated),
// for client-side export. Authorization is enforced by the backend.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId') || '';
  const query = searchParams.get('query')?.trim() || '';

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!OBJECT_ID_RE.test(communityId)) {
    return NextResponse.json({ error: 'Invalid communityId' }, { status: 400 });
  }

  try {
    const url = new URL(`${getBackendUrl()}/api/users/community/${communityId}/export`);
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) url.searchParams.set(key, value);
    }
    if (query) url.searchParams.set('search', query.slice(0, 200));

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to export members' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    console.error('Members export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
