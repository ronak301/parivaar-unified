import { getAdminClient } from "@/lib/auth/admin-client";
import { getCommunityDetailsForId } from "@/lib/api/community";
import { getRemoteConfig } from "@/lib/firebase/config";
import { getCommunityConfig } from "@/lib/firebase/community-config";
import { CommunityDetailTabs } from "@/components/admin/community-detail-tabs";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;
  const api = await getAdminClient();

  const [communityRes, config, communityConfig] = await Promise.all([
    getCommunityDetailsForId(communityId, api),
    getRemoteConfig(),
    getCommunityConfig(communityId),
  ]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{communityRes.data.name}</h1>
        <p className="text-muted-foreground text-sm">
          {communityRes.data.totalMembers ?? 0} members
        </p>
      </div>
      <CommunityDetailTabs
        communityId={communityId}
        community={communityRes.data}
        config={config}
        localities={communityConfig.localities}
      />
    </div>
  );
}
