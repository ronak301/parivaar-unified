'use client';

import { useMemo, useState } from 'react';
import { Search, Store, RefreshCw, X } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { BusinessCard } from '@/components/member/business-card';
import { BusinessListSkeleton, Skeleton } from '@/components/member/skeleton';
import { PageBanner } from '@/components/member/page-banner';
import {
  BusinessStats,
  CategoryChips,
  RecentlyAdded,
  YourBusinessCard,
} from '@/components/member/business-widgets';

interface SearchMatch {
  score: number;
  on: string[];
}

interface BusinessResponse {
  success: boolean;
  businesses: Array<Business & { _match?: SearchMatch }>;
  inferredCategories?: Array<{ id: string; label: string; score: number }>;
}

const MATCH_LABELS: Record<string, string> = {
  name: 'name',
  category: 'category',
  description: 'description',
  owner: 'owner',
  address: 'address',
};

export default function MemberBusinessPage() {
  const { user } = useMemberAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  // Captured once per mount so render stays pure; refresh re-captures it.
  const [now, setNow] = useState(() => Date.now());

  const debouncedQuery = useDebounce(query, 300);
  const communityId = user?.communityIds?.[0];
  const searching = debouncedQuery.trim().length > 0;

  // Full directory (drives widgets + client-side category filter).
  const { data: allData, loading: loadingAll } = useCachedFetch<BusinessResponse>(
    communityId ? `businesses:${communityId}:all:${refreshTick}` : null,
    () => fetch(`/api/member/business/community/${communityId}?limit=100`).then((r) => r.json()),
  );

  // Server-side text search only when the user types.
  const { data: searchData, loading: loadingSearch } = useCachedFetch<BusinessResponse>(
    communityId && searching ? `businesses:${communityId}:q:${debouncedQuery}:${refreshTick}` : null,
    () => {
      const params = new URLSearchParams({ limit: '50', q: debouncedQuery });
      return fetch(`/api/member/business/community/${communityId}?${params}`).then((r) => r.json());
    },
  );

  const { data: mineData } = useCachedFetch<{ business: Business | null }>(
    user ? `business-owner:${user._id}:${refreshTick}` : null,
    () => fetch(`/api/member/business/owner/${user!._id}`).then((r) => r.json()),
  );

  const all = useMemo(() => allData?.businesses ?? [], [allData]);
  const source = searching ? (searchData?.businesses ?? []) : all;
  const inferred = searching ? (searchData?.inferredCategories ?? []) : [];
  const visible = category ? source.filter((b) => b.category === category) : source;
  const loading = searching ? loadingSearch : loadingAll;
  const showWidgets = !searching && !category;

  return (
    <div>
      <PageBanner title="Business Directory" subtitle="Explore members' businesses" tall={false} />

      <div className="sticky top-0 z-10 bg-m-surface/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-m-ink-3" />
            <input
              type="text"
              placeholder="Try: CA, kapda, doctor, car repair…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="m-field pl-9 pr-9"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-m-ink-2"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setRefreshTick((t) => t + 1);
              setNow(Date.now());
            }}
            className="m-field-btn text-m-ink-2 transition-transform active:rotate-180"
            aria-label="Refresh"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-6 pt-1">
        {loading && !all.length ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-16 rounded-2xl" />
            <BusinessListSkeleton />
          </>
        ) : (
          <>
            {showWidgets && all.length > 0 && <BusinessStats businesses={all} now={now} />}
            {showWidgets && mineData !== null && <YourBusinessCard business={mineData?.business ?? null} />}
            {!searching && (
              <CategoryChips businesses={all} selected={category} onSelect={setCategory} />
            )}
            {showWidgets && <RecentlyAdded businesses={all} />}

            <section>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-sm font-bold text-m-ink">
                  {searching ? 'Search results' : category ? 'Filtered' : 'All businesses'}
                </h2>
                <span className="text-xs text-m-ink-2">{visible.length} listed</span>
              </div>

              {searching && inferred.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-m-ink-2">
                  <span>Looks like you want:</span>
                  {inferred.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setQuery('');
                        setCategory(c.id);
                      }}
                      className="rounded-full bg-m-brand/10 px-2.5 py-1 font-semibold text-m-brand"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <BusinessListSkeleton count={3} />
              ) : visible.length === 0 ? (
                <div className="m-card flex flex-col items-center gap-2 py-12">
                  <Store className="size-10 text-m-ink-3" />
                  <p className="text-sm text-m-ink-2">
                    {searching ? `No results for "${debouncedQuery}"` : 'No businesses listed yet'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visible.map((business) => (
                    <BusinessCard
                      key={business._id}
                      business={business}
                      matchHint={
                        searching && business._match && !business._match.on.includes('name')
                          ? `Matched in ${business._match.on.map((k) => MATCH_LABELS[k] ?? k).join(', ')}`
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
