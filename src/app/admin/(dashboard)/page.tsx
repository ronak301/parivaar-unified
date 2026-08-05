import { createAuthenticatedClient } from "@/lib/api/client";
import { getAdminClient } from "@/lib/auth/admin-client";
import { getAllCommunities } from "@/lib/api/community";
import { getRemoteConfig } from "@/lib/firebase/config";
import { CommunitiesTable } from "@/components/admin/communities-table";
import { CreateCommunityDialog } from "@/components/admin/create-community-dialog";

export default async function AdminDashboardPage() {
  const api = await getAdminClient();

  const [communitiesRes, config] = await Promise.all([
    getAllCommunities(api),
    getRemoteConfig(),
  ]);

  const communities = communitiesRes.data.communities ?? [];
  const communityTypes = config?.CommunityTypes ?? [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Communities</h1>
          <p className="text-muted-foreground text-sm">
            {communities.length} communities
          </p>
        </div>
        <CreateCommunityDialog communityTypes={communityTypes} />
      </div>
      <CommunitiesTable communities={communities} />
    </div>
  );
}
