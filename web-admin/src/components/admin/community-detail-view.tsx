'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Community } from '@parivaar/shared';
import { CommunityStatus } from '@parivaar/shared';
import { Building2, MapPin, Phone, MessageCircle, Users, ArrowUpRight } from 'lucide-react';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { readCache } from '@/lib/cache/local-cache';
import { useAuth } from '@/context/auth-context';
import { CommunityDetailTabs } from '@/components/admin/community-detail-tabs';
import { DeleteCommunityButton } from '@/components/admin/delete-community-button';
import { EditCommunityDialog } from '@/components/admin/edit-community-dialog';

function statusTone(status?: string): string {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return 'bg-m-tone-emerald-bg text-m-tone-emerald-fg';
    case 'pending':
      return 'bg-m-tone-amber-bg text-m-tone-amber-fg';
    default:
      return 'bg-white/20 text-white';
  }
}

export function CommunityDetailView({ community }: { community: Community }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [current, setCurrent] = useState(community);
  const [memberCount, setMemberCount] = useState<number | null>(
    () => readCache<{ pagination?: { total?: number } }>(`members_list_${community._id}`)?.pagination?.total ?? null,
  );

  useEffect(() => {
    const params = new URLSearchParams({ communityId: current._id, page: '1', limit: '1' });
    fetch(`/api/admin/members?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { pagination?: { total?: number } } | null) => {
        if (typeof data?.pagination?.total === 'number') {
          setMemberCount(data.pagination.total);
          
        }
      })
      .catch(() => {});
  }, [current._id]);

  const location = [current.city, current.state].filter(Boolean).join(', ');
  const statusLabel = CommunityStatus.find((s) => s.id === current.status)?.label ?? current.status;
  const tel = telLink(current.contactPersonNumber);
  const wa = whatsappLink(current.contactPersonNumber);
  const localityCount = current.localities ? Object.values(current.localities).flat().length : 0;
  const executiveCount = current.designations?.length ?? 0;

  return (
    <div className="flex w-full flex-col pb-8">
      {/* Banner */}
      <div className="m-banner @container relative -mx-6 -mt-6 overflow-hidden px-6 pb-20 pt-7 md:px-10 md:pt-9">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-40 size-44 rounded-full bg-white/10" />

        <div className="relative flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {current.logo ? (
              <img
                src={current.logo}
                alt=""
                className="size-16 shrink-0 rounded-2xl border-2 border-white/40 bg-white object-cover shadow-m-card"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30">
                <Building2 className="size-7" />
              </div>
            )}
            <div className="min-w-0 max-w-3xl">
              <p className="text-sm font-medium text-white/75">Community</p>
              <h1 className="mt-0.5 text-balance text-2xl font-bold leading-tight @3xl:text-3xl">{current.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {location}
                  </span>
                )}
                {statusLabel && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(current.status)}`}>
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <EditCommunityDialog community={current} onUpdated={setCurrent} />
            {isSuperAdmin && (
              <DeleteCommunityButton
                communityId={current._id}
                communityName={current.name}
                className="h-10 rounded-m-field border border-white/25 bg-white/10 px-3.5 text-white hover:bg-white/20 hover:text-white"
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating summary card */}
      <div className="relative z-10 -mt-12 md:px-4">
        <div className="m-card-float grid grid-cols-2 divide-m-line p-2 lg:grid-cols-4 lg:divide-x">
          <Link
            href={`/admin/community/${current._id}/members`}
            className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-m-surface-2"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-m-tone-indigo-bg text-m-tone-indigo-fg">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-m-ink-2">Members</p>
              <p className="flex items-center gap-1 text-base font-bold text-m-ink">
                {memberCount ?? '—'}
                <ArrowUpRight className="size-3.5 text-m-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 p-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-m-tone-violet-bg text-m-tone-violet-fg">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-m-ink-2">Localities</p>
              <p className="text-base font-bold text-m-ink">{localityCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-m-tone-amber-bg text-m-tone-amber-fg">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-m-ink-2">Executives</p>
              <p className="text-base font-bold text-m-ink">{executiveCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-m-ink-2">Contact person</p>
              <p className="truncate text-sm font-semibold text-m-ink">{current.contactPersonName || '—'}</p>
              {current.contactPersonNumber && (
                <p className="text-xs text-m-ink-2">{current.contactPersonNumber}</p>
              )}
            </div>
            {(tel || wa) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {tel && (
                  <a
                    href={tel}
                    aria-label="Call contact person"
                    className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand transition-colors hover:bg-m-brand/20"
                  >
                    <Phone className="size-4" />
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp contact person"
                    className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink transition-colors hover:bg-m-wa/20"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 md:px-4">
        <CommunityDetailTabs community={current} onUpdated={setCurrent} canManageAccess={isSuperAdmin} />
      </div>
    </div>
  );
}
