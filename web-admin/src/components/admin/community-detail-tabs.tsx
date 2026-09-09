'use client';

import { useEffect, useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Info, Award, MapPin, ClipboardCheck, KeyRound, Newspaper } from 'lucide-react';
import { CommunityInfoTab } from '@/components/admin/community-info-tab';
import { CommunityExecutivesTab } from '@/components/admin/community-executives-tab';
import { CommunityLocalitiesTab } from '@/components/admin/community-localities-tab';
import { CommunityApprovalsTab } from '@/components/admin/community-approvals-tab';
import { CommunityAdminAccessTab } from '@/components/admin/community-admin-access-tab';
import { CommunityFeedTab } from '@/components/admin/community-feed-tab';

type TabId = 'info' | 'executives' | 'localities' | 'approvals' | 'feed' | 'access';

export function CommunityDetailTabs({
  community,
  onUpdated,
  canManageAccess = false,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
  /** Super admin only: show the "Admin Access" tab for managing the login. */
  canManageAccess?: boolean;
}) {
  const [tab, setTab] = useState<TabId>('info');
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/admin/communities/${community._id}/approvals?status=pending`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { requests?: unknown[] } | null) => {
        if (data?.requests) setPendingCount(data.requests.length);
      })
      .catch(() => {});
  }, [community._id]);

  const tabs: Array<{ id: TabId; label: string; icon: typeof Info; count?: number }> = [
    { id: 'info', label: 'Details', icon: Info },
    { id: 'executives', label: 'Executives', icon: Award, count: community.designations?.length },
    { id: 'localities', label: 'Localities', icon: MapPin, count: community.localities ? Object.keys(community.localities).length : undefined },
    { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, count: pendingCount ?? undefined },
    { id: 'feed', label: 'Feed', icon: Newspaper },
    ...(canManageAccess
      ? [{ id: 'access' as const, label: 'Admin Access', icon: KeyRound }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Community sections" className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active}
              onClick={() => setTab(id)}
              className="m-chip h-9 px-3.5 text-[13px]"
            >
              <Icon className="size-4" />
              {label}
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 text-[11px] ${
                    active ? 'bg-white/20 text-white' : 'bg-m-surface-2 text-m-ink-2'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === 'info' && <CommunityInfoTab community={community} onUpdated={onUpdated} />}
        {tab === 'feed' && <CommunityFeedTab communityId={community._id} feedEnabled={community.features?.feed === true} />}
        {tab === 'executives' && <CommunityExecutivesTab community={community} onUpdated={onUpdated} />}
        {tab === 'localities' && <CommunityLocalitiesTab community={community} onUpdated={onUpdated} />}
        {tab === 'approvals' && (
          <CommunityApprovalsTab
            communityId={community._id}
            onPendingCountChange={setPendingCount}
          />
        )}
        {tab === 'access' && canManageAccess && (
          <CommunityAdminAccessTab communityId={community._id} communityName={community.name} />
        )}
      </div>
    </div>
  );
}
