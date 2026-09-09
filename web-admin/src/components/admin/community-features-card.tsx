'use client';

import { useState } from 'react';
import { Loader2, Newspaper } from 'lucide-react';
import type { Community } from '@parivaar/shared';

/** Per-community feature flag switches. Saved immediately on toggle. */
export function CommunityFeaturesCard({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const feedOn = community.features?.feed === true;

  async function toggleFeed() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${community._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: { feed: !feedOn } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update');
        return;
      }
      onUpdated(data.community);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="m-card px-4 lg:col-span-2">
      <div className="flex items-center gap-3 py-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-m-tone-rose-bg text-m-tone-rose-fg">
          <Newspaper className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-m-ink">Community feed</p>
          <p className="text-xs text-m-ink-2">
            Members can post matrimonial profiles, business enquiries and new businesses (all go through approval).
          </p>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={feedOn}
          disabled={saving}
          onClick={toggleFeed}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            feedOn ? 'bg-m-brand' : 'bg-m-line-strong'
          } disabled:opacity-60`}
        >
          <span
            className={`absolute top-0.5 flex size-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
              feedOn ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          >
            {saving && <Loader2 className="size-3 animate-spin text-m-ink-2" />}
          </span>
        </button>
      </div>
    </div>
  );
}
