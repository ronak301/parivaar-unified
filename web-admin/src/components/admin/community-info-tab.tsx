'use client';

import type { Community } from '@parivaar/shared';
import { CommunityStatus } from '@parivaar/shared';
import { Building2, User, Phone, MapPin, CircleDot, AlignLeft, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CommunityFeaturesCard } from '@/components/admin/community-features-card';

function Row({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Building2;
  tone: string;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs text-m-ink-2">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-m-ink">{value || <span className="text-m-ink-3">Not set</span>}</p>
      </div>
    </div>
  );
}

export function CommunityInfoTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated?: (community: Community) => void;
}) {
  const location = [community.city, community.state].filter(Boolean).join(', ');
  const status = CommunityStatus.find((s) => s.id === community.status)?.label ?? community.status;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {onUpdated && <CommunityFeaturesCard community={community} onUpdated={onUpdated} />}
      <div className="m-card px-4">
        <div className="divide-y divide-m-line">
          <Row icon={Building2} tone="bg-m-tone-indigo-bg text-m-tone-indigo-fg" label="Community name" value={community.name} />
          <Row icon={CircleDot} tone="bg-m-tone-emerald-bg text-m-tone-emerald-fg" label="Status" value={status} />
          <Row icon={MapPin} tone="bg-m-tone-violet-bg text-m-tone-violet-fg" label="Location" value={location} />
          <Row icon={CalendarDays} tone="bg-m-tone-sky-bg text-m-tone-sky-fg" label="Created" value={formatDate(community.createdAt)} />
        </div>
      </div>

      <div className="m-card px-4">
        <div className="divide-y divide-m-line">
          <Row icon={User} tone="bg-m-tone-amber-bg text-m-tone-amber-fg" label="Contact person" value={community.contactPersonName} />
          <Row icon={Phone} tone="bg-m-tone-teal-bg text-m-tone-teal-fg" label="Contact number" value={community.contactPersonNumber} />
          <Row icon={AlignLeft} tone="bg-m-tone-pink-bg text-m-tone-pink-fg" label="About" value={community.description} />
        </div>
      </div>
    </div>
  );
}
