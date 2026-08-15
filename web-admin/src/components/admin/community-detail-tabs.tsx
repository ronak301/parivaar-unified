'use client';

import type { Community } from '@parivaar/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityInfoTab } from '@/components/admin/community-info-tab';
import { CommunityMembersTab } from '@/components/admin/community-members-tab';
import { CommunityExecutivesTab } from '@/components/admin/community-executives-tab';
import { CommunityLocalitiesTab } from '@/components/admin/community-localities-tab';
import { CommunityApprovalsTab } from '@/components/admin/community-approvals-tab';

export function CommunityDetailTabs({
  community,
  onUpdated,
  refreshKey,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
  refreshKey?: number;
}) {
  return (
    <Tabs defaultValue="info">
      <TabsList variant="line" className="h-10 border-b border-border">
        <TabsTrigger value="info" className="px-4 text-base">Info</TabsTrigger>
        <TabsTrigger value="members" className="px-4 text-base">Members</TabsTrigger>
        <TabsTrigger value="executives" className="px-4 text-base">Executives</TabsTrigger>
        <TabsTrigger value="localities" className="px-4 text-base">Localities</TabsTrigger>
        <TabsTrigger value="approvals" className="px-4 text-base">Approvals</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <CommunityInfoTab community={community} />
      </TabsContent>
      <TabsContent value="members">
        <CommunityMembersTab communityId={community._id} refreshKey={refreshKey} />
      </TabsContent>
      <TabsContent value="executives">
        <CommunityExecutivesTab community={community} onUpdated={onUpdated} />
      </TabsContent>
      <TabsContent value="localities">
        <CommunityLocalitiesTab community={community} onUpdated={onUpdated} />
      </TabsContent>
      <TabsContent value="approvals">
        <CommunityApprovalsTab communityId={community._id} />
      </TabsContent>
    </Tabs>
  );
}
