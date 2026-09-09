'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Newspaper, RefreshCw } from 'lucide-react';
import type { FeedItem, FeedItemType } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useCommunityFeatures } from '@/lib/member/use-community-features';
import { PageBanner } from '@/components/member/page-banner';
import { FeedCard } from '@/components/member/feed-card';
import { FEED_SUBMITTED_EVENT } from '@/components/member/feed-composer';
import { MySubmissions } from '@/components/member/my-submissions';
import { BusinessListSkeleton } from '@/components/member/skeleton';

const PAGE_SIZE = 20;

const FILTERS: Array<{ id: FeedItemType | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'matrimonial', label: 'Matrimonial' },
  { id: 'business_enquiry', label: 'Enquiries' },
];

export default function MemberFeedPage() {
  const router = useRouter();
  const { user } = useMemberAuth();
  const communityId = user?.communityIds?.[0];
  const { feedEnabled, loading: loadingFlags } = useCommunityFeatures(communityId);

  const [filter, setFilter] = useState<FeedItemType | 'all'>('all');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bump = () => setRefreshTick((t) => t + 1);
    window.addEventListener(FEED_SUBMITTED_EVENT, bump);
    return () => window.removeEventListener(FEED_SUBMITTED_EVENT, bump);
  }, []);

  useEffect(() => {
    if (!loadingFlags && !feedEnabled && communityId) router.replace('/m');
  }, [loadingFlags, feedEnabled, communityId, router]);

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (filter !== 'all') params.set('type', filter);
      return `/api/member/feed/community/${communityId}?${params}`;
    },
    [communityId, filter],
  );

  useEffect(() => {
    if (!communityId || !feedEnabled) return;
    let cancelled = false;
    pageRef.current = 1;
    startTransition(() => {
      setLoading(true);
      setItems([]);
    });
    fetch(buildUrl(1))
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(d.items ?? []);
        setTotal(d.pagination?.total ?? 0);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, feedEnabled, buildUrl, refreshTick]);

  const loadMore = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      const d = await fetch(buildUrl(next)).then((r) => r.json());
      pageRef.current = next;
      setItems((prev) => [...prev, ...(d.items ?? [])]);
      setTotal(d.pagination?.total ?? 0);
    } catch {
      // ignore
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !busyRef.current && items.length < total) loadMore();
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [items.length, total, loadMore]);

  if (!user) return null;

  return (
    <div>
      <PageBanner
        title="Community Feed"
        subtitle="Matrimonial, enquiries & new businesses"
        tall={false}
        action={
          <button
            type="button"
            onClick={() => setRefreshTick((t) => t + 1)}
            aria-label="Refresh"
            className="rounded-full p-1.5 transition-colors hover:bg-white/15 active:rotate-180"
          >
            <RefreshCw className="size-5" />
          </button>
        }
      />

      <div className="sticky top-0 z-10 bg-m-surface/85 px-4 py-2.5 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              data-active={filter === f.id}
              onClick={() => setFilter(f.id)}
              className="m-chip"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <MySubmissions refreshKey={refreshTick} />

      <div className="flex flex-col gap-4 px-4 pb-28 pt-3">
        {loading ? (
          <BusinessListSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="m-card flex flex-col items-center gap-2 py-14 text-center">
            <Newspaper className="size-10 text-m-ink-3" />
            <p className="text-sm font-semibold text-m-ink">Nothing here yet</p>
            <p className="max-w-[240px] text-xs text-m-ink-2">
              Tap the + button to add a matrimonial profile, post an enquiry, or list your business.
            </p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <FeedCard key={item._id} item={item} />
            ))}
            {items.length < total && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                {loadingMore && <Loader2 className="size-5 animate-spin text-m-brand" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
