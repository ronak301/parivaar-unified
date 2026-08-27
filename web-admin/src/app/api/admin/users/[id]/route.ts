import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getUser, deleteUser } from '@/lib/api/user';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const user = await getUser(client, id);
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return respondToAuthError(e, 'Failed to fetch user');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  try {
    const client = await getAdminClient();
    const res = await client.put(`/users/${id}`, body);
    return NextResponse.json(res.data);
  } catch (e: any) {
    // Extract detailed error from backend response
    if (e.response?.data?.error) {
      return NextResponse.json(
        { error: e.response.data.error, details: e.response.data.details },
        { status: e.response.status || 502 }
      );
    }
    return respondToAuthError(e, 'Failed to update user');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cascade = searchParams.get('cascade') === 'true';

  try {
    const client = await getAdminClient();
    const url = cascade ? `/users/${id}?cascade=true` : `/users/${id}`;
    const data = await deleteUser(client, id, url);
    return NextResponse.json(data);
  } catch (e) {
    return respondToAuthError(e, 'Failed to delete member');
  }
}
