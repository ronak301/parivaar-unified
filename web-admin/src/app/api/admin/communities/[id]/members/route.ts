import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getUsersByCommunity } from '@/lib/api/user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || undefined;
  const limit = Number(searchParams.get('limit')) || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const client = await getAdminClient();
    const data = await getUsersByCommunity(client, id, { page, limit, search });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load members';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
