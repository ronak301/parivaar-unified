import Link from 'next/link';
import { ArrowRight, Briefcase, Clock, LayoutGrid, Sparkles, Store } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { getBusinessCategoryStyle } from '@/lib/member/business-category-style';
import { getCategoryLabel, getOwnerName } from './business-card';
import { TONE_CLASS } from '@/lib/member/theme';

/* ---------- Stats strip ---------- */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function BusinessStats({ businesses, now }: { businesses: Business[]; now: number }) {
  if (businesses.length < 5) return null;

  const categories = new Set(businesses.map((b) => b.category).filter(Boolean)).size;
  const monthAgo = now - THIRTY_DAYS_MS;
  const newThisMonth = businesses.filter((b) => b.createdAt && new Date(b.createdAt).getTime() > monthAgo).length;

  const items = [
    { icon: Store, label: 'Businesses', value: businesses.length, tone: TONE_CLASS.indigo },
    { icon: LayoutGrid, label: 'Categories', value: categories, tone: TONE_CLASS.emerald },
    { icon: Clock, label: 'New this month', value: newThisMonth, tone: TONE_CLASS.amber },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="m-card rounded-xl p-3">
          <div className={`flex size-7 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="size-3.5" />
          </div>
          <p className="mt-2 text-lg font-bold leading-none text-m-ink">{value}</p>
          <p className="mt-1 text-[11px] text-m-ink-2">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Category chips ---------- */

export function CategoryChips({
  businesses,
  selected,
  onSelect,
}: {
  businesses: Business[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const counts = new Map<string, number>();
  for (const b of businesses) if (b.category) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length < 2) return null;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip active={selected === null} onClick={() => onSelect(null)}>
        All <span className="opacity-70">{businesses.length}</span>
      </Chip>
      {entries.map(([id, count]) => {
        const { icon: Icon, color, bg } = getBusinessCategoryStyle(id);
        const active = selected === id;
        return (
          <Chip key={id} active={active} onClick={() => onSelect(active ? null : id)}>
            <span className="flex size-4 items-center justify-center rounded" style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : bg, color: active ? 'inherit' : color }}>
              <Icon className="size-2.5" />
            </span>
            {getCategoryLabel(id)} <span className="opacity-70">{count}</span>
          </Chip>
        );
      })}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className="m-chip shrink-0"
    >
      {children}
    </button>
  );
}

/* ---------- Recently added carousel ---------- */

export function RecentlyAdded({ businesses }: { businesses: Business[] }) {
  const recent = [...businesses]
    .filter((b) => b.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 6);
  if (recent.length < 4) return null;

  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="size-4 text-m-tone-amber-fg" />
        <h2 className="text-sm font-bold text-m-ink">Recently added</h2>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recent.map((b) => {
          const { icon: Icon, color, bg } = getBusinessCategoryStyle(b.category);
          return (
            <Link
              key={b._id}
              href={`/m/business/${b._id}`}
              className="w-36 shrink-0 snap-start rounded-m-card p-3 ring-1 ring-m-line transition-shadow active:shadow-none"
              style={{ backgroundColor: bg }}
            >
              {b.logo ? (
                <img src={b.logo} alt="" className="size-10 rounded-xl object-cover" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/70" style={{ color }}>
                  <Icon className="size-5" />
                </div>
              )}
              <p className="mt-2.5 line-clamp-2 text-[13px] font-bold leading-snug text-m-ink">{b.name}</p>
              <p className="mt-0.5 truncate text-[11px]" style={{ color }}>
                {getCategoryLabel(b.category)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- "Your business" spotlight ---------- */

export function YourBusinessCard({ business }: { business: Business | null }) {
  if (business) {
    const { icon: Icon, color, bg } = getBusinessCategoryStyle(business.category);
    return (
      <Link
        href={`/m/business/${business._id}`}
        className="m-banner flex items-center gap-3 rounded-m-card p-3.5 shadow-md"
      >
        {business.logo ? (
          <img src={business.logo} alt="" className="size-11 rounded-xl object-cover ring-2 ring-white/40" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color }}>
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">Your business</p>
          <p className="truncate text-sm font-bold">{business.name}</p>
          <p className="truncate text-xs opacity-80">{getCategoryLabel(business.category)}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 opacity-90" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-m-card border border-dashed border-m-brand/30 bg-m-brand/5 p-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-m-brand/10 text-m-brand">
        <Briefcase className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-m-ink">Own a business?</p>
        <p className="text-xs text-m-ink-2">Ask your community admin to list it here so members can find you.</p>
      </div>
    </div>
  );
}

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
