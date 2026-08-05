import { getAdminClient } from "@/lib/auth/admin-client";
import { getMemberDetails } from "@/lib/api/user";
import { getRemoteConfig } from "@/lib/firebase/config";
import { MemberDetailView } from "@/components/admin/member-detail-view";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ communityId: string; memberId: string }>;
}) {
  const { communityId, memberId } = await params;
  const api = await getAdminClient();

  const [memberRes, config] = await Promise.all([
    getMemberDetails(memberId, api),
    getRemoteConfig(),
  ]);

  return (
    <div className="p-8">
      <MemberDetailView
        communityId={communityId}
        member={memberRes.data.data}
        config={config}
      />
    </div>
  );
}
