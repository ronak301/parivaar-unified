'use client';

import { useState } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { BusinessTypes } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface BusinessFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onApply: (categories: string[]) => void;
  /** Category ids that actually exist in this community — shown first. */
  availableIds?: string[];
  counts?: Record<string, number>;
}

interface FilterBodyProps {
  initial: string[];
  availableIds: string[];
  counts: Record<string, number>;
  onApply: (categories: string[]) => void;
}

// Lives inside SheetContent, which unmounts when the sheet closes — so the
// draft is re-seeded from `initial` on every open without any effect.
function FilterBody({ initial, availableIds, counts, onApply }: FilterBodyProps) {
  const [draft, setDraft] = useState<string[]>(initial);

  const available = new Set(availableIds);
  const ordered = [...BusinessTypes].sort((a, b) => {
    const aIn = available.has(a.id) ? 0 : 1;
    const bIn = available.has(b.id) ? 0 : 1;
    if (aIn !== bIn) return aIn - bIn;
    return a.label.localeCompare(b.label);
  });

  function toggle(id: string) {
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  return (
    <>
      <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
      <SheetHeader className="flex-row items-center justify-between pb-2">
        <div>
          <SheetTitle>Filter by category</SheetTitle>
          <SheetDescription>
            {draft.length ? `${draft.length} selected` : 'Showing all categories'}
          </SheetDescription>
        </div>
        {draft.length > 0 && (
          <button onClick={() => setDraft([])} className="text-sm font-medium text-primary">
            Clear
          </button>
        )}
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto px-4 pb-2">
        {ordered.map((bt) => {
          const active = draft.includes(bt.id);
          const count = counts[bt.id];
          const inCommunity = available.has(bt.id);
          return (
            <button
              key={bt.id}
              type="button"
              onClick={() => toggle(bt.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : inCommunity
                    ? 'border-border bg-card text-foreground'
                    : 'border-border/60 bg-card text-muted-foreground'
              }`}
            >
              {active && <Check className="size-3" />}
              {bt.label}
              {count ? (
                <span className={`text-[10px] ${active ? 'opacity-80' : 'text-muted-foreground'}`}>
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <Button className="h-12 w-full gap-2 rounded-xl" onClick={() => onApply(draft)}>
          <SlidersHorizontal className="size-4" />
          Apply{draft.length ? ` (${draft.length})` : ''}
        </Button>
      </div>
    </>
  );
}

export function BusinessFilterSheet({
  open,
  onOpenChange,
  selected,
  onApply,
  availableIds = [],
  counts = {},
}: BusinessFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto flex max-h-[85dvh] w-full max-w-md flex-col gap-0 rounded-t-3xl border-0 p-0"
      >
        <FilterBody
          initial={selected}
          availableIds={availableIds}
          counts={counts}
          onApply={(cats) => {
            onApply(cats);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
