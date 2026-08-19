'use client';

import { useEffect, useState } from 'react';
import type { Community } from '@parivaar/shared';
import { CommunitiesListView } from '@/components/admin/communities-list-view';
import { readCache, writeCache } from '@/lib/cache/local-cache';

const CACHE_KEY = 'communities_full_list';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(() => readCache<Community[]>(CACHE_KEY) ?? []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => readCache<Community[]>(CACHE_KEY) === null);

  useEffect(() => {
    const hadCache = readCache<Community[]>(CACHE_KEY) !== null;

    async function loadCommunities() {
      try {
        const res = await fetch('/api/admin/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setCommunities(data.communities || []);
        writeCache(CACHE_KEY, data.communities || []);
      } catch (e) {
        if (!hadCache) setError(e instanceof Error ? e.message : 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    }

    loadCommunities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Communities</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return <CommunitiesListView initialCommunities={communities} error={error} />;
}
