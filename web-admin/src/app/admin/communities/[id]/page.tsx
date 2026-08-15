'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Community } from '@parivaar/shared';
import { CommunityDetailView } from '@/components/admin/community-detail-view';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCommunity() {
      try {
        const res = await fetch(`/api/admin/communities/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Community not found');
          } else {
            throw new Error('Failed to fetch');
          }
          return;
        }

        const data = await res.json();
        setCommunity(data.community);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load community');
      } finally {
        setLoading(false);
      }
    }

    loadCommunity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }

  return <CommunityDetailView community={community} />;
}
