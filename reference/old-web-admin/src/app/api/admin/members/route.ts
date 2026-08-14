import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth/admin-client";
import { getCommunityMembersForCommunityId } from "@/lib/api/community";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { communityId, skip, limit, query, filter } = body ?? {};
  if (!communityId) {
    return NextResponse.json({ error: "communityId is required" }, { status: 400 });
  }

  const api = await getAdminClient();
  const res = await getCommunityMembersForCommunityId(
    communityId,
    skip ?? 0,
    limit ?? 10,
    query ?? "",
    filter ?? {},
    api
  );
  return NextResponse.json(res.data);
}
