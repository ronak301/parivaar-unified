import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { getOwnerName } from './business-card';

/* ---------- Owner strip on detail page ---------- */

export function OwnerStrip({ business }: { business: Business }) {
  const name = getOwnerName(business);
  const owner = business.ownerId as unknown as { _id?: string } | string;
  const ownerId = typeof owner === 'object' ? owner?._id : owner;
  if (!name || !ownerId) return null;
  return (
    <Link href={`/m/member/${ownerId}`} className="flex items-center gap-3 rounded-xl bg-m-surface-2 p-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-sm font-bold text-m-brand">
        {name[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-m-ink-2">Owned by</p>
        <p className="truncate text-sm font-semibold">{name}</p>
      </div>
      <ArrowRight className="size-4 text-m-ink-2" />
    </Link>
  );
}
