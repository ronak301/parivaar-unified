import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const remarks = typeof body?.remarks === 'string' ? body.remarks.slice(0, 500) : undefined;

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
  }

  try {
    const client = await getAdminClient();
    const res = await client.put(`/approvals/${id}/review`, { status, remarks });
    return NextResponse.json({ success: true, request: res.data.request });
  } catch (e) {
    return respondToAuthError(e, 'Failed to review approval request');
  }
}
