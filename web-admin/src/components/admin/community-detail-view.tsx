'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { CommunityDetailTabs } from '@/components/admin/community-detail-tabs';
import { DeleteCommunityButton } from '@/components/admin/delete-community-button';
import { EditCommunityDialog } from '@/components/admin/edit-community-dialog';

export function CommunityDetailView({ community }: { community: Community }) {
  const [current, setCurrent] = useState(community);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{current.name}</h1>
          <div className="flex items-center gap-2">
            <EditCommunityDialog community={current} onUpdated={setCurrent} />
            <DeleteCommunityButton communityId={current._id} communityName={current.name} />
          </div>
        </div>
      </div>

      <CommunityDetailTabs community={current} onUpdated={setCurrent} />
    </div>
  );
}
