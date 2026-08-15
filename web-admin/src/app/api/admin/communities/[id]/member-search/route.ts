import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { searchUsers } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const query = request.nextUrl.searchParams.get('query') ?? '';

  if (!query.trim()) {
    return NextResponse.json({ users: [] });
  }

  try {
    const client = await getAdminClient();
    const users = await searchUsers(client, id, query.trim());
    return NextResponse.json({ users });
  } catch (e) {
    return respondToAuthError(e, 'Failed to search members');
  }
}
