'use client';

import { CheckCircle2, X } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

interface FeedSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Bottom sheet shell shared by the three "add to feed" forms. */
export function FeedSheet({ open, onOpenChange, title, description, children }: FeedSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="member-app mx-auto flex max-h-[92dvh] w-full max-w-md flex-col gap-0 rounded-t-3xl border-0 bg-m-surface p-0"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-m-ink-3/40" />
        <div className="flex items-start justify-between px-4 pb-2 pt-3">
          <div className="min-w-0">
            <SheetTitle className="text-m-ink">{title}</SheetTitle>
            {description && <SheetDescription className="text-m-ink-2">{description}</SheetDescription>}
          </div>
          <SheetClose className="rounded-full p-1.5 text-m-ink-2 hover:bg-m-surface-2">
            <X className="size-4" />
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function SubmittedState({ title, body, onDone }: { title: string; body: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-m-tone-emerald-bg text-m-tone-emerald-fg">
        <CheckCircle2 className="size-7" />
      </div>
      <p className="text-base font-bold text-m-ink">{title}</p>
      <p className="max-w-xs text-sm text-m-ink-2">{body}</p>
      <button type="button" onClick={onDone} className="m-primary-btn mt-2">
        Done
      </button>
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-xs font-semibold text-m-ink">{children}</span>
      {hint && <span className="text-[11px] text-m-ink-3">{hint}</span>}
    </div>
  );
}
