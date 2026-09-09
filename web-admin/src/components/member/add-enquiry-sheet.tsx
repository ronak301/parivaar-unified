'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { extractApiErrorMessage } from '@/lib/api/error-message';
import { FeedSheet, FieldLabel, SubmittedState } from './feed-sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmitted?: () => void;
}

function Body({ user, onDone }: { user: User; onDone: () => void }) {
  const communityId = user.communityIds?.[0];
  const [requirement, setRequirement] = useState('');
  const [place, setPlace] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!communityId || !requirement.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/member/business/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          requirement: requirement.trim(),
          place: place.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(extractApiErrorMessage(json, 'Failed to submit enquiry'));
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SubmittedState
        title="Enquiry sent for approval"
        body="Once the admin approves, members will see it in the feed and can reach you."
        onDone={onDone}
      />
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 pt-2">
      <div>
        <FieldLabel hint={`${requirement.length}/1000`}>What are you looking for?</FieldLabel>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value.slice(0, 1000))}
          placeholder="e.g. Need a CA for GST filing, looking for a wholesale saree supplier…"
          className="m-textarea"
          rows={4}
          required
        />
      </div>
      <div>
        <FieldLabel hint="Optional">Place</FieldLabel>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value.slice(0, 200))}
          placeholder="City or area"
          className="m-field px-3"
        />
      </div>

      <p className="text-xs text-m-ink-2">
        {user.showPhoneInCommunity === false
          ? 'Your phone is hidden from the community, so members will see only your name.'
          : 'Your name and phone will be shown so members can contact you.'}
      </p>

      {error && <p className="text-sm text-m-danger">{error}</p>}

      <button type="submit" disabled={!requirement.trim() || submitting} className="m-primary-btn">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Send for approval
      </button>
    </form>
  );
}

export function AddEnquirySheet({ open, onOpenChange, user, onSubmitted }: Props) {
  return (
    <FeedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Post a business enquiry"
      description="Ask the community for a product or service"
    >
      <Body
        user={user}
        onDone={() => {
          onSubmitted?.();
          onOpenChange(false);
        }}
      />
    </FeedSheet>
  );
}
