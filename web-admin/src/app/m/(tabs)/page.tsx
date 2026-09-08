'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import type { Community, UserListItem } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useDirectoryFilters, appendFilterParams, countActiveFilters } from '@/lib/member/directory-filters';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { DirectoryHeader, type HomeTab } from '@/components/member/directory-header';
import { ExecutiveCommittee } from '@/components/member/executive-committee';
import { MemberCard } from '@/components/member/member-card';
import { MemberListSkeleton, Skeleton } from '@/components/member/skeleton';

interface SearchResponse {
  success: boolean;
  users: UserListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

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

  const searchCacheKey = communityId
    ? `members:${communityId}:${debouncedSearch}:${filtersKey}:${familyHeadOnly}`
    : null;

  const { data: searchData, loading } = useCachedFetch<SearchResponse>(
    searchCacheKey,
    () => {
      const params = new URLSearchParams({ communityId: communityId!, page: '1', limit: '30' });
      if (debouncedSearch) params.set('query', debouncedSearch);
      appendFilterParams(params, filters);
      if (familyHeadOnly) params.set('filters[isFamilyHead]', 'true');
      return fetch(`/api/member/users/search?${params}`).then((r) => r.json());
    },
  );

  const communityName = communityData?.community?.name ?? 'Community';
  const designations = communityData?.community?.designations ?? [];
  const members: UserListItem[] = searchData?.users ?? [];
  const total = searchData?.pagination?.total ?? 0;

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
            members.map((member) => <MemberCard key={member._id} member={member} />)
          )}
        </div>
      )}
    </div>
  );
}
