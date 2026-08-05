"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MembersTab } from "@/components/admin/members-tab";
import { CommunityInfoTab } from "@/components/admin/community-info-tab";
import { ExecutiveMembersTab } from "@/components/admin/executive-members-tab";
import { LocalitiesTab } from "@/components/admin/localities-tab";
import type { Community, RemoteConfig } from "@/lib/api/types";

export function CommunityDetailTabs({
  communityId,
  community,
  config,
  localities,
}: {
  communityId: string;
  community: Community;
  config: RemoteConfig | undefined;
  localities: string[];
}) {
  return (
    <Tabs defaultValue="members">
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="info">Community Info</TabsTrigger>
        <TabsTrigger value="executives">Executive Members</TabsTrigger>
        <TabsTrigger value="localities">Localities</TabsTrigger>
      </TabsList>
      <TabsContent value="members" className="pt-4">
        <MembersTab communityId={communityId} config={config} />
      </TabsContent>
      <TabsContent value="info" className="pt-4">
        <CommunityInfoTab community={community} config={config} />
      </TabsContent>
      <TabsContent value="executives" className="pt-4">
        <ExecutiveMembersTab executives={community.executives ?? []} />
      </TabsContent>
      <TabsContent value="localities" className="pt-4">
        <LocalitiesTab communityId={communityId} initialLocalities={localities} />
      </TabsContent>
    </Tabs>
  );
}
