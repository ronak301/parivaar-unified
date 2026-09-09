'use client';

import { useState } from 'react';
import { Check, FileImage, Loader2, Upload } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { uploadBiodata } from '@/lib/firebase/storage';
import { extractApiErrorMessage } from '@/lib/api/error-message';
import { getAvatarColor } from '@/lib/member/avatar-color';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { ClickableImage } from '@/components/ui/clickable-image';
import { relationLabel, type FamilyMember } from './family-section';
import { FeedSheet, FieldLabel, SubmittedState } from './feed-sheet';

interface FamilyTreeResponse {
  members: FamilyMember[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmitted?: () => void;
}

function resolveFamilyId(familyId: User['familyId']): string | undefined {
  if (!familyId) return undefined;
  if (typeof familyId === 'string') return familyId;
  return (familyId as { _id?: string })._id;
}

function displayName(m: { firstName?: string; lastName?: string; fullName?: string }) {
  return m.fullName ?? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
}

function ageOf(dob?: string): number | undefined {
  if (!dob) return undefined;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 86_400_000));
}

function Body({ user, onDone }: { user: User; onDone: () => void }) {
  const familyId = resolveFamilyId(user.familyId);
  const communityId = user.communityIds?.[0];

  const { data, loading } = useCachedFetch<FamilyTreeResponse>(
    familyId ? `family-tree:${familyId}` : null,
    () => fetch(`/api/member/families/${familyId}/tree`).then((r) => r.json()),
  );

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [biodata, setBiodata] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const self: FamilyMember = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    profilePicture: user.profilePicture,
    gender: user.gender,
    dob: user.dob,
    isAlive: user.isAlive,
  };
  const others = (data?.members ?? []).filter((m) => m._id !== user._id && m.isAlive !== false);
  const candidates = [self, ...others];

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    try {
      setBiodata(await uploadBiodata(file, candidateId ?? user._id));
    } catch {
      setError('Failed to upload biodata. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!candidateId || !communityId) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/member/matrimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidateId, communityId, biodataFile: biodata || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(extractApiErrorMessage(json, 'Failed to submit'));
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
        title="Sent for approval"
        body="Your community admin will review the profile. It will appear in the feed once approved."
        onDone={onDone}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <p className="rounded-xl bg-m-tone-pink-bg px-3 py-2 text-xs text-m-tone-pink-fg">
        Phone numbers are never shown on matrimonial posts. Interested families reach out through your family.
      </p>

      <div>
        <FieldLabel>Who is this profile for?</FieldLabel>
        {loading && !data ? (
          <div className="flex items-center gap-2 py-4 text-sm text-m-ink-2">
            <Loader2 className="size-4 animate-spin" /> Loading family…
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {candidates.map((m) => {
              const name = displayName(m);
              const selected = candidateId === m._id;
              const color = getAvatarColor(name);
              const rel = m._id === user._id ? 'You' : relationLabel(user, m);
              const meta = [rel, ageOf(m.dob) ? `${ageOf(m.dob)} yrs` : undefined].filter(Boolean).join(' · ');
              return (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => setCandidateId(m._id)}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                    selected ? 'border-m-brand bg-m-brand/5' : 'border-m-line bg-m-surface'
                  }`}
                >
                  {m.profilePicture ? (
                    <img src={m.profilePicture} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {`${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-m-ink">{name}</span>
                    {meta && <span className="block text-xs text-m-ink-2">{meta}</span>}
                  </span>
                  <span
                    className={`flex size-5 items-center justify-center rounded-full border ${
                      selected ? 'border-m-brand bg-m-brand text-m-on-brand' : 'border-m-line-strong'
                    }`}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <FieldLabel hint="Image, up to 3 MB">Biodata</FieldLabel>
        <ImageUploadField fieldKey="biodata" onFileReady={handleFile} onError={setError}>
          {({ openFilePicker }) => (
            <div className="flex items-center gap-3">
              {biodata ? (
                <ClickableImage src={biodata} alt="Biodata" className="size-16 rounded-xl object-cover ring-1 ring-m-line" />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-xl bg-m-surface-2 text-m-ink-3">
                  <FileImage className="size-6" />
                </span>
              )}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="m-chip h-9 px-3.5 text-[13px]"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? 'Uploading…' : biodata ? 'Replace' : 'Upload biodata'}
              </button>
            </div>
          )}
        </ImageUploadField>
      </div>

      {error && <p className="text-sm text-m-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={!candidateId || submitting || uploading}
        className="m-primary-btn"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Send for approval
      </button>
    </div>
  );
}

export function AddMatrimonialSheet({ open, onOpenChange, user, onSubmitted }: Props) {
  return (
    <FeedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add matrimonial candidate"
      description="Pick a family member and attach their biodata"
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
