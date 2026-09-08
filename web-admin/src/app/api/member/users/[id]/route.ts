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
    const res = await client.get(`/users/${id}`);
    return NextResponse.json(res.data);
  } catch (error) {
    return respondToMemberAuthError(error, 'Failed to fetch member');
  }
}

// Direct member self-edit is intentionally not exposed. Members submit changes
// via POST /api/member/profile-edit, which creates an approval request for the
// community admin; the profile only updates once approved.
