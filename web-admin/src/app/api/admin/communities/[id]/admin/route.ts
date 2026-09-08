import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

// GET: read the community's admin login info (username + createdAt, never password).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const res = await client.get(`/communities/${id}/admin`);
    return NextResponse.json(res.data);
  } catch (e) {
    return respondToAuthError(e, 'Failed to load admin login');
  }
}

// POST: create the community's admin login; returns credentials once.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const res = await client.post(`/communities/${id}/admin`);
    return NextResponse.json(res.data, { status: 201 });
  } catch (e) {
    return respondToAuthError(e, 'Failed to create admin login');
  }
}

// DELETE: remove the community's admin login.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getAdminClient();
    const res = await client.delete(`/communities/${id}/admin`);
    return NextResponse.json(res.data);
  } catch (e) {
    return respondToAuthError(e, 'Failed to remove admin login');
  }
}
