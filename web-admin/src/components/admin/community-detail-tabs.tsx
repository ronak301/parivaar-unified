'use client';

import type { Community } from '@parivaar/shared';
import { Tabs } from '@chakra-ui/react';
import { CommunityInfoTab } from '@/components/admin/community-info-tab';
import { CommunityExecutivesTab } from '@/components/admin/community-executives-tab';
import { CommunityLocalitiesTab } from '@/components/admin/community-localities-tab';
import { CommunityApprovalsTab } from '@/components/admin/community-approvals-tab';

export function CommunityDetailTabs({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  return (
    <div className="chakra-scope">
      <Tabs.Root defaultValue="info" variant="line" size="lg" colorPalette="brand">
        <Tabs.List>
          <Tabs.Trigger value="info">Info</Tabs.Trigger>
          <Tabs.Trigger value="executives">Executives</Tabs.Trigger>
          <Tabs.Trigger value="localities">Localities</Tabs.Trigger>
          <Tabs.Trigger value="approvals">Approvals</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="info" pt="5">
          <CommunityInfoTab community={community} />
        </Tabs.Content>
        <Tabs.Content value="executives" pt="5">
          <CommunityExecutivesTab community={community} onUpdated={onUpdated} />
        </Tabs.Content>
        <Tabs.Content value="localities" pt="5">
          <CommunityLocalitiesTab community={community} onUpdated={onUpdated} />
        </Tabs.Content>
        <Tabs.Content value="approvals" pt="5">
          <CommunityApprovalsTab communityId={community._id} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
