'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Loader2 } from 'lucide-react';
import type { Community, UserListItem } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useDirectoryFilters, appendFilterParams, countActiveFilters } from '@/lib/member/directory-filters';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { DirectoryHeader, type HomeTab } from '@/components/member/directory-header';
import { ExecutiveCommittee } from '@/components/member/executive-committee';
import { MemberCard } from '@/components/member/member-card';
import { MemberListSkeleton, Skeleton } from '@/components/member/skeleton';

/**
 * useSearchParams requires a Suspense boundary for static prerendering;
 * the fallback mirrors the loaded layout so there is no flash.
 */
export default function MemberHomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 pt-24">
          <MemberListSkeleton />
        </div>
      }
    >
      <MemberHome />
    </Suspense>
  );
}

function MemberHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useMemberAuth();
  const { filters } = useDirectoryFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const [familyHeadOnly, setFamilyHeadOnly] = useState(false);

  // Tab lives in the URL (?tab=executives) so back navigation and deep links work.
  const tab: HomeTab = searchParams.get('tab') === 'executives' ? 'executives' : 'members';
  function setTab(next: HomeTab) {
    router.replace(next === 'members' ? '/m' : `/m?tab=${next}`, { scroll: false });
  }

  const debouncedSearch = useDebounce(searchQuery, 300);
  const communityId = user?.communityIds?.[0];
  const activeFilterCount = countActiveFilters(filters);
  const filtersKey = JSON.stringify(filters);

  const { data: communityData, loading: loadingCommunity } = useCachedFetch<{ community: Community }>(
    communityId ? `community:${communityId}` : null,
    () => fetch(`/api/member/community/${communityId}`).then((r) => r.json()),
  );

  const PAGE_SIZE = 30;
  const [members, setMembers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [memberLoading, setMemberLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  function buildMemberUrl(page: number) {
    const params = new URLSearchParams({ communityId: communityId!, page: String(page), limit: String(PAGE_SIZE) });
    if (debouncedSearch) params.set('query', debouncedSearch);
    appendFilterParams(params, filters);
    if (familyHeadOnly) params.set('filters[isFamilyHead]', 'true');
    return `/api/member/users/search?${params}`;
  }

  // Fetch page 1 whenever search/filter params change
  useEffect(() => {
    if (!communityId) return;
    let cancelled = false;
    setMemberLoading(true);
    setMembers([]);
    pageRef.current = 1;

    fetch(buildMemberUrl(1))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setMembers(data.users ?? []);
        setTotal(data.pagination?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMemberLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, debouncedSearch, filtersKey, familyHeadOnly]);

  const loadMore = useCallback(async () => {
    if (!communityId || loadingRef.current) return;
    const nextPage = pageRef.current + 1;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch(buildMemberUrl(nextPage));
      const data = await res.json();
      pageRef.current = nextPage;
      setMembers((prev) => [...prev, ...(data.users ?? [])]);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      // silently ignore
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, debouncedSearch, filtersKey, familyHeadOnly]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current && members.length < total) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [members.length, total, loadMore]);

  const loading = memberLoading;
  const communityName = communityData?.community?.name ?? 'Community';
  const designations = communityData?.community?.designations ?? [];

  return (
    <div>
      <DirectoryHeader
        communityName={communityName}
        tab={tab}
        onTabChange={setTab}
        executiveCount={designations.length}
        total={total}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        familyHeadOnly={familyHeadOnly}
        onFamilyHeadOnlyChange={setFamilyHeadOnly}
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => router.push('/m/filters')}
      />

      {tab === 'executives' ? (
        <div className="p-4">
          {loadingCommunity && !communityData ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-[72px] rounded-xl" />
              <Skeleton className="h-[72px] rounded-xl" />
              <Skeleton className="h-[72px] rounded-xl" />
            </div>
          ) : (
            <ExecutiveCommittee designations={designations} />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {loading ? (
            <MemberListSkeleton />
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <Users className="size-10 text-m-ink-3" />
              <p className="text-sm text-m-ink-2">No members found</p>
            </div>
          ) : (
            <>
              {members.map((member) => <MemberCard key={member._id} member={member} />)}
              {members.length < total && (
                <div ref={sentinelRef} className="flex items-center justify-center py-4">
                  {loadingMore && <Loader2 className="size-5 animate-spin text-m-brand" />}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
