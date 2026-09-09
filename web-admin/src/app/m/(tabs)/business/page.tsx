'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, Search, SlidersHorizontal, Store, X } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { getBusinessCategoryStyle } from '@/lib/member/business-category-style';
import { BusinessCard, getCategoryLabel } from '@/components/member/business-card';
import { BusinessListSkeleton } from '@/components/member/skeleton';
import { PageBanner } from '@/components/member/page-banner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface SearchMatch {
  score: number;
  on: string[];
}

type ListedBusiness = Business & { _match?: SearchMatch };

interface BusinessResponse {
  success: boolean;
  businesses: ListedBusiness[];
  inferredCategories?: Array<{ id: string; label: string; score: number }>;
  pagination?: { total: number };
}

interface CategoryCountsResponse {
  success: boolean;
  total: number;
  categories: Array<{ id: string; count: number }>;
}

const MATCH_LABELS: Record<string, string> = {
  name: 'name',
  category: 'category',
  description: 'description',
  owner: 'owner',
  address: 'address',
};

const PAGE_SIZE = 30;

export default function MemberBusinessPage() {
  const { user } = useMemberAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const communityId = user?.communityIds?.[0];
  const searching = debouncedQuery.trim().length > 0;

  const { data: categoryData } = useCachedFetch<CategoryCountsResponse>(
    communityId ? `business-categories:${communityId}` : null,
    () => fetch(`/api/member/business/categories/${communityId}`).then((r) => r.json()),
  );
  const categories = categoryData?.categories ?? [];
  const totalListed = categoryData?.total ?? 0;

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (searching) params.set('q', debouncedQuery.trim());
      if (category) params.set('category', category);
      return `/api/member/business/community/${communityId}?${params}`;
    },
    [communityId, debouncedQuery, searching, category],
  );

  // The list is keyed by its page-1 URL, so a search/filter change shows the
  // skeleton by derivation instead of an imperative reset.
  const requestKey = communityId ? buildUrl(1) : null;
  const [result, setResult] = useState<{
    key: string;
    items: ListedBusiness[];
    total: number;
    inferred: Array<{ id: string; label: string }>;
    page: number;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    fetch(requestKey)
      .then((r) => r.json())
      .then((data: BusinessResponse) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          items: data.businesses ?? [],
          total: data.pagination?.total ?? 0,
          inferred: data.inferredCategories ?? [],
          page: 1,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const ready = result !== null && result.key === requestKey;
  const loading = !ready;
  const items = ready ? result.items : [];
  const total = ready ? result.total : 0;
  const inferred = ready ? result.inferred : [];

  const loadMore = useCallback(async () => {
    if (!ready || !requestKey || loadingRef.current) return;
    const nextPage = result.page + 1;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data: BusinessResponse = await fetch(buildUrl(nextPage)).then((r) => r.json());
      setResult((prev) =>
        prev && prev.key === requestKey
          ? { ...prev, items: [...prev.items, ...(data.businesses ?? [])], total: data.pagination?.total ?? prev.total, page: nextPage }
          : prev,
      );
    } catch {
      // keep what we have; the sentinel retries on the next intersection
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [ready, requestKey, result, buildUrl]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current && items.length < total) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, total, loadMore]);

  const activeCategoryLabel = category ? getCategoryLabel(category) : undefined;
  const heading = searching ? 'Search results' : activeCategoryLabel ?? 'All businesses';

  return (
    <div>
      <PageBanner title="Business Directory" subtitle={totalListed ? `${totalListed} businesses` : undefined} tall={false} />

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
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Filter by category"
            className="m-field-btn relative text-m-ink-2"
          >
            <SlidersHorizontal className="size-4" />
            {category && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-m-brand text-[10px] font-semibold text-m-on-brand">
                1
              </span>
            )}
          </button>
        </div>

        {category && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              data-active
              className="m-chip"
              aria-label={`Remove ${activeCategoryLabel} filter`}
            >
              {activeCategoryLabel}
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-1">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-m-ink">{heading}</h2>
          {!loading && <span className="text-xs text-m-ink-2">{total} listed</span>}
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
          <BusinessListSkeleton />
        ) : items.length === 0 ? (
          <div className="m-card flex flex-col items-center gap-2 py-12">
            <Store className="size-10 text-m-ink-3" />
            <p className="text-sm text-m-ink-2">
              {searching ? `No results for "${debouncedQuery}"` : 'No businesses listed yet'}
            </p>
            {category && (
              <button onClick={() => setCategory('')} className="text-xs font-semibold text-m-brand">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((business) => (
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
            {items.length < total && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                {loadingMore && <Loader2 className="size-5 animate-spin text-m-brand" />}
              </div>
            )}
          </div>
        )}
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="member-app max-h-[85dvh] rounded-t-2xl p-0">
          <SheetHeader className="flex-row items-center justify-between border-b border-m-line px-4 py-3">
            <SheetTitle className="text-base font-bold text-m-ink">Filter by category</SheetTitle>
            {category && (
              <button
                type="button"
                onClick={() => {
                  setCategory('');
                  setFilterOpen(false);
                }}
                className="text-sm font-medium text-m-brand"
              >
                Clear
              </button>
            )}
          </SheetHeader>
          <div className="overflow-y-auto px-2 py-2">
            <CategoryRow
              label="All businesses"
              count={totalListed}
              active={!category}
              onClick={() => {
                setCategory('');
                setFilterOpen(false);
              }}
            />
            {categories.map((c) => {
              const { icon: Icon, color, bg } = getBusinessCategoryStyle(c.id);
              return (
                <CategoryRow
                  key={c.id}
                  label={getCategoryLabel(c.id) ?? c.id}
                  count={c.count}
                  active={category === c.id}
                  icon={<Icon className="size-4" />}
                  iconStyle={{ backgroundColor: bg, color }}
                  onClick={() => {
                    setCategory(c.id);
                    setFilterOpen(false);
                  }}
                />
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CategoryRow({
  label,
  count,
  active,
  icon,
  iconStyle,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
  iconStyle?: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-m-brand/10' : 'active:bg-m-surface-2'
      }`}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-m-surface-2 text-m-ink-2"
        style={iconStyle}
      >
        {icon ?? <Store className="size-4" />}
      </span>
      <span className={`min-w-0 flex-1 truncate text-sm ${active ? 'font-bold text-m-brand' : 'font-medium text-m-ink'}`}>
        {label}
      </span>
      <span className="text-xs tabular-nums text-m-ink-2">{count}</span>
      {active && <Check className="size-4 text-m-brand" />}
    </button>
  );
}
