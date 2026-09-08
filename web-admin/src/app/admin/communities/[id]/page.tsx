'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Community } from '@parivaar/shared';
import { CommunityDetailView } from '@/components/admin/community-detail-view';
import { readCache, writeCache } from '@/lib/cache/local-cache';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [community, setCommunity] = useState<Community | null>(() => readCache<Community>(`community_detail_${id}`));
  const [loading, setLoading] = useState(() => readCache<Community>(`community_detail_${id}`) === null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cacheKey = `community_detail_${id}`;
    const cached = readCache<Community>(cacheKey);

    async function loadCommunity() {
      try {
        const res = await fetch(`/api/admin/communities/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (!res.ok) {
          if (!cached) {
            if (res.status === 404) {
              setError('Community not found');
            } else {
              throw new Error('Failed to fetch');
            }
          }
          return;
        }

        const data = await res.json();
        setCommunity(data.community);
        writeCache(cacheKey, data.community);
      } catch (e) {
        if (!cached) setError(e instanceof Error ? e.message : 'Failed to load community');
      } finally {
        setLoading(false);
      }
    }

    loadCommunity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col pb-8" role="status" aria-label="Loading community">
        <div className="m-banner -mx-6 -mt-6 h-48 animate-pulse opacity-80" />
        <div className="relative z-10 -mt-12 md:px-4">
          <div className="m-card-float grid grid-cols-2 gap-2 p-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="size-11 animate-pulse rounded-full bg-m-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded-md bg-m-surface-2" />
                  <div className="h-4 w-1/3 animate-pulse rounded-md bg-m-surface-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="m-card max-w-sm p-6 text-center">
          <p className="font-semibold text-m-ink">{error || 'Community not found'}</p>
          <p className="mt-1 text-sm text-m-ink-2">Pick another community from the switcher above.</p>
        </div>
      </div>
    );
  }

  return <CommunityDetailView community={community} />;
}
