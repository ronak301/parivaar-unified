import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { createBusiness } from '@/lib/api/business';
import { respondToAuthError } from '@/lib/api/route-error';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const business = await createBusiness(client, body);
    return NextResponse.json({ success: true, business }, { status: 201 });
  } catch (e: any) {
    // Extract detailed error from backend response
    if (e.response?.data) {
      const backendData = e.response.data;
      return NextResponse.json(
        {
          error: backendData.error || 'Failed to create business',
          details: backendData.details || undefined,
        },
        { status: e.response.status || 400 }
      );
    }
    return respondToAuthError(e, 'Failed to create business');
  }
}
