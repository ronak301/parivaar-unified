'use client';

import Link from 'next/link';
import { Award, Building2, ChevronRight, MapPin, MessageCircle, Phone, UserRound } from 'lucide-react';
import type { Community } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { PageBanner } from '@/components/member/page-banner';
import { Skeleton } from '@/components/member/skeleton';

interface CommunityResponse {
  success: boolean;
  community: Community;
}

export default function MemberCommunityPage() {
  const { user } = useMemberAuth();
  const communityId = user?.communityIds?.[0];

  const { data, loading } = useCachedFetch<CommunityResponse>(
    communityId ? `community:${communityId}` : null,
    () => fetch(`/api/member/community/${communityId}`).then((r) => r.json()),
  );

  const community = data?.community ?? null;
  const location = [community?.city, community?.state].filter(Boolean).join(', ');
  const tel = telLink(community?.contactPersonNumber);
  const wa = whatsappLink(community?.contactPersonNumber);

  if (loading || !community) {
    return (
      <div>
        <PageBanner title="Community" showBack />
        <div className="relative z-10 -mt-12 px-4">
          <div className="m-card-float p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBanner title="Community" subtitle="About your sangh" showBack />

      <div className="relative z-10 -mt-12 px-4">
        <div className="m-card-float p-4">
          <div className="flex items-center gap-4">
            {community.logo ? (
              <img src={community.logo} alt="" className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-m-line" />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-m-brand/10 text-m-brand">
                <Building2 className="size-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold leading-snug text-m-ink">{community.name}</h1>
              {location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-m-ink-2">
                  <MapPin className="size-3.5 shrink-0" />
                  {location}
                </p>
              )}
            </div>
          </div>

          {community.description && (
            <p className="mt-3 text-sm leading-relaxed text-m-ink-2">{community.description}</p>
          )}

          {community.contactPersonName && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-m-surface-2 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-m-ink-2">Contact person</p>
                <p className="truncate text-sm font-semibold text-m-ink">{community.contactPersonName}</p>
                {community.contactPersonNumber && (
                  <p className="text-xs text-m-ink-2">{community.contactPersonNumber}</p>
                )}
              </div>
              {tel && (
                <a href={tel} aria-label="Call" className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
                  <Phone className="size-4" />
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink"
                >
                  <MessageCircle className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 pt-5">
        <Link
          href="/m?tab=executives"
          className="flex items-center gap-3 rounded-xl bg-m-surface p-3.5 ring-1 ring-m-line active:bg-m-surface-2"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
            <Award className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-m-ink">Executive committee</p>
            <p className="text-xs text-m-ink-2">{community.designations?.length ?? 0} office bearers</p>
          </div>
          <ChevronRight className="size-4 text-m-ink-3" />
        </Link>
      </div>
    </div>
  );
}
