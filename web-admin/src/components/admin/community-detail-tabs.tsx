'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityInfoTab } from '@/components/admin/community-info-tab';
import { CommunityMembersTab } from '@/components/admin/community-members-tab';
import { CommunityExecutivesTab } from '@/components/admin/community-executives-tab';
import { CommunityLocalitiesTab } from '@/components/admin/community-localities-tab';
import { CommunityApprovalsTab } from '@/components/admin/community-approvals-tab';

export function CommunityDetailTabs({ community }: { community: Community }) {
  const [current, setCurrent] = useState(community);

  return (
    <Tabs defaultValue="info">
      <TabsList>
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="executives">Executives</TabsTrigger>
        <TabsTrigger value="localities">Localities</TabsTrigger>
        <TabsTrigger value="approvals">Approvals</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <CommunityInfoTab community={current} onUpdated={setCurrent} />
      </TabsContent>
      <TabsContent value="members">
        <CommunityMembersTab communityId={current._id} />
      </TabsContent>
      <TabsContent value="executives">
        <CommunityExecutivesTab community={current} onUpdated={setCurrent} />
      </TabsContent>
      <TabsContent value="localities">
        <CommunityLocalitiesTab community={current} onUpdated={setCurrent} />
      </TabsContent>
      <TabsContent value="approvals">
        <CommunityApprovalsTab communityId={current._id} />
      </TabsContent>
    </Tabs>
  );
}
