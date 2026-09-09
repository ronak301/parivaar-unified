'use client';

import { useCallback, useEffect, useState } from 'react';
import { Heart, Search, Store, Trash2 } from 'lucide-react';
import type { FeedItem, FeedItemType } from '@parivaar/shared';
import { BusinessTypes } from '@parivaar/shared';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_META: Record<FeedItemType, { label: string; icon: typeof Heart; tone: string }> = {
  matrimonial: { label: 'Matrimonial', icon: Heart, tone: 'bg-m-tone-pink-bg text-m-tone-pink-fg' },
  business_enquiry: { label: 'Enquiry', icon: Search, tone: 'bg-m-tone-amber-bg text-m-tone-amber-fg' },
  business: { label: 'Business', icon: Store, tone: 'bg-m-tone-teal-bg text-m-tone-teal-fg' },
};

function personName(p?: { fullName?: string; firstName?: string; lastName?: string }) {
  if (!p) return '-';
  return p.fullName ?? ([p.firstName, p.lastName].filter(Boolean).join(' ') || '-');
}

function summary(item: FeedItem): { title: string; sub?: string } {
  if (item.type === 'matrimonial' && item.matrimonial) {
    const u = item.matrimonial.user;
    return { title: personName(u), sub: [u.gender, u.education, u.address?.city].filter(Boolean).join(' · ') };
  }
  if (item.type === 'business_enquiry' && item.enquiry) {
    return { title: item.enquiry.requirement, sub: [personName(item.enquiry.user), item.enquiry.place].filter(Boolean).join(' · ') };
  }
  if (item.type === 'business' && item.business) {
    const b = item.business;
    const cat = BusinessTypes.find((bt) => bt.id === b.category)?.label ?? b.category;
    const owner = b.ownerId as unknown as { fullName?: string; firstName?: string; lastName?: string } | undefined;
    return { title: b.name ?? 'Business', sub: [cat, personName(owner)].filter(Boolean).join(' · ') };
  }
  return { title: '-' };
}

export function CommunityFeedTab({ communityId, feedEnabled }: { communityId: string; feedEnabled: boolean }) {
  const [type, setType] = useState<FeedItemType | 'all'>('all');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<FeedItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '50' });
    if (type !== 'all') params.set('type', type);
    fetch(`/api/admin/communities/${communityId}/feed?${params}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? 'Failed to load feed');
        return json.items as FeedItem[];
      })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load feed'))
      .finally(() => setLoading(false));
  }, [communityId, type]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    if (!confirm) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/feed/${confirm._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Failed to remove');
        return;
      }
      setItems((prev) => prev.filter((i) => i._id !== confirm._id));
      setConfirm(null);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="m-card flex flex-col gap-4 p-4">
      {!feedEnabled && (
        <p className="rounded-lg bg-m-tone-amber-bg px-3 py-2 text-sm text-m-tone-amber-fg">
          Feed is turned off for members. Enable it from the Details tab. Approved items are still listed here.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Select value={type} onValueChange={(v) => setType(v as FeedItemType | 'all')}>
          <SelectTrigger size="lg" className="w-fit">
            <SelectValue>{(v: string) => (v === 'all' ? 'All types' : TYPE_META[v as FeedItemType].label)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(TYPE_META) as FeedItemType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_META[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-m-ink-2">{items.length} items</span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-sm text-m-ink-2">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-m-ink-2">Nothing in the feed yet.</p>
      ) : (
        <ul className="divide-y divide-m-line">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const { title, sub } = summary(item);
            const biodata = item.matrimonial?.biodataFile;
            return (
              <li key={item._id} className="flex items-start gap-3 py-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{meta.label}</Badge>
                    <span className="text-xs text-m-ink-3">{formatDate(item.createdAt)}</span>
                    {item.postedBy && <span className="text-xs text-m-ink-3">· by {personName(item.postedBy)}</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-m-ink">{title}</p>
                  {sub && <p className="text-xs text-m-ink-2">{sub}</p>}
                  {biodata && (
                    <a href={biodata} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-primary">
                      View biodata
                    </a>
                  )}
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Remove from feed" onClick={() => setConfirm(item)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from feed?</AlertDialogTitle>
            <AlertDialogDescription>
              Members will no longer see this post. The underlying record is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={removing}>
              {removing ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
