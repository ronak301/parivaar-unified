'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, ExternalLink } from 'lucide-react';
import { CommunityDetailTabs } from '@/components/admin/community-detail-tabs';
import { DeleteCommunityButton } from '@/components/admin/delete-community-button';
import { EditCommunityDialog } from '@/components/admin/edit-community-dialog';
import { AddFamilyDialog } from '@/components/admin/add-family-dialog';
import { ClickableAvatar } from '@/components/ui/clickable-image';

export function CommunityDetailView({ community }: { community: Community }) {
  const [current, setCurrent] = useState(community);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/communities" className="w-fit inline-flex items-center gap-1 text-sm hover:bg-muted px-3 py-2 rounded-lg transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to communities</span>
        </Link>

        <div className="flex items-start gap-3">
          <ClickableAvatar
            src={current.logo}
            alt={current.name}
            fallback={<Building2 className="size-5 text-primary" />}
            size="lg"
            className="size-10"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{current.name}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              {current.status && <Badge variant="secondary">{current.status}</Badge>}
              {current.city && current.state && (
                <Badge variant="outline">
                  {current.city}, {current.state}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/community/${current._id}/form`, '_blank')}
            >
              <ExternalLink />
              Open Form
            </Button>
            {current.status === 'Active' && (
              <AddFamilyDialog
                community={current}
                onMemberAdded={() => setRefreshKey((k) => k + 1)}
              />
            )}
            <EditCommunityDialog community={current} onUpdated={setCurrent} />
            <DeleteCommunityButton communityId={current._id} communityName={current.name} />
          </div>
        </div>
      </div>

      <CommunityDetailTabs community={current} onUpdated={setCurrent} refreshKey={refreshKey} />
    </div>
  );
}
