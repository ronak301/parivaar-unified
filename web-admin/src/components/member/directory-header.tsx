'use client';

import { Search, SlidersHorizontal, Info } from 'lucide-react';
import Link from 'next/link';
import { PageBanner } from './page-banner';

export type HomeTab = 'members' | 'executives';

interface DirectoryHeaderProps {
  communityName: string;
  tab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  total: number;
  executiveCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  familyHeadOnly: boolean;
  onFamilyHeadOnlyChange: (value: boolean) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

export function DirectoryHeader({
  communityName,
  tab,
  onTabChange,
  total,
  executiveCount,
  searchQuery,
  onSearchChange,
  familyHeadOnly,
  onFamilyHeadOnlyChange,
  activeFilterCount,
  onOpenFilters,
}: DirectoryHeaderProps) {
  const tabs: Array<{ id: HomeTab; label: string; count: number }> = [
    { id: 'members', label: 'All members', count: total },
    { id: 'executives', label: 'Executives', count: executiveCount },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 bg-m-surface/85 pb-1 backdrop-blur-md">
      <PageBanner
        title={communityName}
        tall={false}
        action={
          <Link
            href="/m/community"
            aria-label="About community"
            className="rounded-full p-1.5 transition-colors hover:bg-white/15"
          >
            <Info className="size-5" />
          </Link>
        }
      />

      <div className="px-4" role="tablist" aria-label="Directory sections">
        <div className="flex rounded-xl bg-m-surface-2 p-1">
          {tabs.map(({ id, label, count }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  active ? 'bg-m-surface text-m-brand shadow-sm' : 'text-m-ink-2'
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-px text-[11px] ${
                    active ? 'bg-m-brand/10 text-m-brand' : 'bg-m-ink-3/15 text-m-ink-2'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'members' && (
        <>
          <div className="flex items-center gap-2 px-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-m-ink-3" />
              <input
                type="text"
                placeholder="Search by name, number..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="m-field pl-9 pr-3"
              />
            </div>
            <button onClick={onOpenFilters} className="m-field-btn relative" aria-label="Filters">
              <SlidersHorizontal className="size-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-m-brand text-[10px] text-m-on-brand">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between px-4">
            <p className="text-sm text-m-ink-2">{total} members</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              Family Heads Only
              <button
                type="button"
                role="switch"
                aria-checked={familyHeadOnly}
                onClick={() => onFamilyHeadOnlyChange(!familyHeadOnly)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  familyHeadOnly ? 'bg-m-brand' : 'bg-m-ink-3/40'
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                    familyHeadOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
