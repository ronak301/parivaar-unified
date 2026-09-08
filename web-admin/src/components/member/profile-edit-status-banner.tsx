'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, XCircle } from 'lucide-react';
import type { ApprovalRequest, ProfileEditPayload } from '@parivaar/shared';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  profilePicture: 'Profile photo',
  guardianName: 'Guardian name',
  dob: 'Date of birth',
  weddingDate: 'Wedding date',
  gender: 'Gender',
  email: 'Email',
  education: 'Education',
  specialEducation: 'Special education',
  bloodGroup: 'Blood group',
  hobbies: 'Hobbies',
  achievements: 'Achievements',
  nativePlace: 'Native place',
  nativeDistrict: 'Native district',
  nanihaal: 'Nanihaal',
  aadharLast4: 'Aadhar (last 4)',
  address: 'Address',
};

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    if (value.startsWith('http')) return 'Updated';
    return value;
  }
  if (typeof value === 'object') {
    const parts = Object.values(value as Record<string, unknown>).filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }
  return String(value);
}

/**
 * Shows the member the state of their latest self-edit request.
 * Pending: yellow, with a collapsible diff. Rejected: red, with remarks.
 * Approved requests older than a few days are not shown (the profile already reflects them).
 */
interface BannerProps {
  request: ApprovalRequest | null;
  /** Current time (ms). Passed in so render stays pure; hook provides it. */
  now: number;
}

export function ProfileEditStatusBanner({ request, now }: BannerProps) {
  const [open, setOpen] = useState(false);
  if (!request) return null;

  const payload = (request.payload ?? {}) as Partial<ProfileEditPayload>;
  const changes = payload.changes ?? {};
  const previous = payload.previous ?? {};
  const fields = Object.keys(changes);
  const when = request.updatedAt ?? request.createdAt;
  const whenText = when ? new Date(when).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

  if (request.status === 'approved') {
    const ageDays = when ? (now - new Date(when).getTime()) / 86_400_000 : Infinity;
    if (ageDays > 3) return null;
    return (
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
        <CheckCircle2 className="size-5 shrink-0" />
        <p className="text-sm">
          Your profile changes were <span className="font-semibold">approved</span>
          {whenText ? ` on ${whenText}` : ''}.
        </p>
      </div>
    );
  }

  const pending = request.status === 'pending';
  const tone = pending
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-rose-200 bg-rose-50 text-rose-900';
  const Icon = pending ? Clock : XCircle;

  return (
    <div className={`mx-4 mt-4 rounded-xl border p-3 ${tone}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={open}
      >
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {pending ? 'Changes awaiting admin approval' : 'Your changes were not approved'}
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            {pending
              ? `${fields.length} field${fields.length === 1 ? '' : 's'} submitted${whenText ? ` on ${whenText}` : ''}. Your profile will update once the community admin approves.`
              : request.remarks
                ? `Reason: ${request.remarks}`
                : 'You can edit your profile again to resubmit.'}
          </p>
        </div>
        {fields.length > 0 && (
          <ChevronDown className={`mt-1 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && fields.length > 0 && (
        <ul className="mt-3 divide-y divide-current/10 border-t border-current/10 pt-2 text-xs">
          {fields.map((f) => (
            <li key={f} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="shrink-0 opacity-70">{FIELD_LABELS[f] ?? f}</span>
              <span className="min-w-0 truncate text-right">
                <span className="line-through opacity-50">{display(previous[f])}</span>
                <span className="mx-1 opacity-50">→</span>
                <span className="font-semibold">{display(changes[f])}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
