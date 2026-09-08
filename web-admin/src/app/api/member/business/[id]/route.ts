import { NextRequest, NextResponse } from 'next/server';
import { getMemberClient } from '@/lib/auth/member-client';
import { respondToMemberAuthError } from '@/lib/api/member-route-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getMemberClient();
    const res = await client.get(`/businesses/${id}`);
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch business');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const client = await getMemberClient();
    const body = await request.json();
    const res = await client.put(`/businesses/${id}`, body);
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to update business');
  }
}
