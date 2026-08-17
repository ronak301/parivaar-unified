import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getBusinessByOwner } from '@/lib/api/business';
import { respondToAuthError } from '@/lib/api/route-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  try {
    const client = await getAdminClient();
    const business = await getBusinessByOwner(client, userId);
    return NextResponse.json({ success: true, business });
  } catch (e) {
    return respondToAuthError(e, 'Failed to fetch business');
  }
}
