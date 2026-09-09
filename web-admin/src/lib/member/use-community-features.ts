'use client';

import type { Community } from '@parivaar/shared';
import { useCachedFetch } from './use-cached-fetch';

/** Per-community feature flags. Shares the `community:<id>` cache entry with the home screen. */
export function useCommunityFeatures(communityId?: string) {
  const { data, loading } = useCachedFetch<{ community: Community }>(
    communityId ? `community:${communityId}` : null,
    () => fetch(`/api/member/community/${communityId}`).then((r) => r.json()),
  );
  return {
    loading,
    feedEnabled: data?.community?.features?.feed === true,
  };
}
