import { NextRequest, NextResponse } from 'next/server';
import type { ApprovalStatus } from '@parivaar/shared';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getApprovalRequests } from '@/lib/api/approval';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const status = (searchParams.get('status') as ApprovalStatus | null) ?? undefined;
  const page = Number(searchParams.get('page')) || undefined;
  const limit = Number(searchParams.get('limit')) || undefined;

  try {
    const client = await getAdminClient();
    const data = await getApprovalRequests(client, id, { status, page, limit });
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load approval requests';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
