import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { reviewApproval } from '@/lib/api/approval';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json(
      { error: 'Status must be approved or rejected' },
      { status: 400 },
    );
  }

  try {
    const client = await getAdminClient();
    const request_ = await reviewApproval(client, id, status);
    return NextResponse.json({ success: true, request: request_ });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to review approval request';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
