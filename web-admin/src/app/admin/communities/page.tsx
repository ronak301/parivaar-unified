'use client';

import { useEffect, useState } from 'react';
import type { Community } from '@parivaar/shared';
import { CommunitiesListView } from '@/components/admin/communities-list-view';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunities() {
      try {
        const res = await fetch('/api/admin/communities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setCommunities(data.communities || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load communities');
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
