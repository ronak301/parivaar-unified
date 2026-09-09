'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, XCircle } from 'lucide-react';
import type { ApprovalRequest } from '@parivaar/shared';

const TYPE_LABEL: Record<string, string> = {
  matrimonial: 'Matrimonial profile',
  business_enquiry: 'Business enquiry',
  business: 'Business listing',
};

function summarize(r: ApprovalRequest): string {
  const p = (r.payload ?? {}) as Record<string, unknown>;
  if (r.entityType === 'matrimonial') return typeof p.candidateName === 'string' ? p.candidateName : '';
  if (r.entityType === 'business_enquiry') return typeof p.requirement === 'string' ? p.requirement : '';
  if (r.entityType === 'business') return typeof p.name === 'string' ? p.name : '';
  return '';
}

/**
 * Compact status strip at the top of the feed: shows the member's pending and
 * recently rejected submissions so they know why something is not visible yet.
 */
export function MySubmissions({ refreshKey }: { refreshKey: number }) {
  const [state, setState] = useState<{ requests: ApprovalRequest[]; fetchedAt: number }>({ requests: [], fetchedAt: 0 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/member/feed/submissions')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setState({ requests: d.requests ?? [], fetchedAt: Date.now() });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const cutoff = state.fetchedAt - 7 * 86_400_000;
  const visible = state.requests.filter((r) => {
    if (r.status === 'pending') return true;
    const when = new Date(r.updatedAt ?? r.createdAt ?? 0).getTime();
    return r.status === 'rejected' && when > cutoff;
  });
  if (visible.length === 0) return null;

  const pending = visible.filter((r) => r.status === 'pending').length;
  const rejected = visible.length - pending;

  return (
    <div className="mx-4 mt-3 rounded-xl border border-m-line bg-m-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Clock className="size-4 text-m-tone-amber-fg" />
        <span className="flex-1 text-sm text-m-ink">
          {pending > 0 && <span className="font-semibold">{pending} awaiting approval</span>}
          {pending > 0 && rejected > 0 && ' · '}
          {rejected > 0 && <span className="font-semibold text-m-danger">{rejected} not approved</span>}
        </span>
        <ChevronDown className={`size-4 text-m-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="divide-y divide-m-line border-t border-m-line">
          {visible.map((r) => {
            const Icon = r.status === 'pending' ? Clock : r.status === 'rejected' ? XCircle : CheckCircle2;
            const tone = r.status === 'pending' ? 'text-m-tone-amber-fg' : 'text-m-danger';
            return (
              <li key={r._id} className="flex items-start gap-2 px-3 py-2">
                <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-m-ink">{TYPE_LABEL[r.entityType] ?? r.entityType}</p>
                  <p className="truncate text-xs text-m-ink-2">{summarize(r)}</p>
                  {r.status === 'rejected' && r.remarks && (
                    <p className="mt-0.5 text-[11px] text-m-danger">Reason: {r.remarks}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
