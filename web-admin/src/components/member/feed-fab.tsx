'use client';

import { useState } from 'react';
import { Heart, Plus, Search, Store, X } from 'lucide-react';

export type FeedAction = 'matrimonial' | 'enquiry' | 'business';

const ACTIONS: Array<{ id: FeedAction; label: string; icon: typeof Heart; bg: string; fg: string }> = [
  { id: 'matrimonial', label: 'Add matrimonial candidate', icon: Heart, bg: 'bg-m-tone-pink-bg', fg: 'text-m-tone-pink-fg' },
  { id: 'enquiry', label: 'Post business enquiry', icon: Search, bg: 'bg-m-tone-amber-bg', fg: 'text-m-tone-amber-fg' },
  { id: 'business', label: 'Add my business', icon: Store, bg: 'bg-m-tone-teal-bg', fg: 'text-m-tone-teal-fg' },
];

interface FeedFabProps {
  onAction: (action: FeedAction) => void;
  /** Hide "Add my business" when the member already has one. */
  hideBusiness?: boolean;
}

/** Floating "+" button above the tab bar that fans out the three feed actions. */
export function FeedFab({ onAction, hideBusiness }: FeedFabProps) {
  const [open, setOpen] = useState(false);
  const actions = hideBusiness ? ACTIONS.filter((a) => a.id !== 'business') : ACTIONS;

  function pick(action: FeedAction) {
    setOpen(false);
    onAction(action);
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-m-ink/30 backdrop-blur-[2px]"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto flex w-full max-w-md flex-col items-end gap-3 px-4">
        {open &&
          actions.map(({ id, label, icon: Icon, bg, fg }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => pick(id)}
              style={{ animationDelay: `${(actions.length - 1 - i) * 40}ms` }}
              className="pointer-events-auto flex animate-in items-center gap-3 fade-in slide-in-from-bottom-2"
            >
              <span className="rounded-full bg-m-surface px-3 py-1.5 text-sm font-semibold text-m-ink shadow-m-card">
                {label}
              </span>
              <span className={`flex size-11 items-center justify-center rounded-full shadow-m-card ${bg} ${fg}`}>
                <Icon className="size-5" />
              </span>
            </button>
          ))}

        <button
          type="button"
          aria-label={open ? 'Close' : 'Add to feed'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-m-brand text-m-on-brand shadow-m-float transition-transform active:scale-95"
        >
          {open ? <X className="size-6" /> : <Plus className="size-7" strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}
