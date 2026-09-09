'use client';

import { useState } from 'react';
import { FileImage, Loader2, Upload, UserRound } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { Gender } from '@parivaar/shared';
import { uploadBiodata, uploadUserPhoto } from '@/lib/firebase/storage';
import { extractApiErrorMessage } from '@/lib/api/error-message';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { ClickableImage } from '@/components/ui/clickable-image';
import { FeedSheet, FieldLabel, SubmittedState } from './feed-sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmitted?: () => void;
}

function Body({ user, onDone }: { user: User; onDone: () => void }) {
  const communityId = user.communityIds?.[0];
  const [form, setForm] = useState({ name: '', dob: '', gender: '', qualification: '' });
  const [photo, setPhoto] = useState('');
  const [biodata, setBiodata] = useState('');
  const [uploading, setUploading] = useState<'photo' | 'biodata' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleUpload(kind: 'photo' | 'biodata', file: File) {
    setUploading(kind);
    setError('');
    try {
      const key = `${user._id}-${kind}`;
      if (kind === 'photo') setPhoto(await uploadUserPhoto(file, key));
      else setBiodata(await uploadBiodata(file, key));
    } catch {
      setError(`Failed to upload ${kind}. Please try again.`);
    } finally {
      setUploading(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!communityId || !form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/member/matrimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          name: form.name.trim(),
          dob: form.dob || undefined,
          gender: form.gender || undefined,
          qualification: form.qualification.trim() || undefined,
          photo: photo || undefined,
          biodataFile: biodata || undefined,
        }),
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pt-2">
      <p className="rounded-xl bg-m-tone-pink-bg px-3 py-2 text-xs text-m-tone-pink-fg">
        Phone numbers are never shown on matrimonial posts. Interested families reach out through you.
      </p>

      <ImageUploadField fieldKey="profilePhoto" onFileReady={(f) => handleUpload('photo', f)} onError={setError}>
        {({ openFilePicker }) => (
          <div className="flex items-center gap-3">
            {photo ? (
              <ClickableImage src={photo} alt="Candidate photo" className="size-16 rounded-full object-cover ring-1 ring-m-line" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-full bg-m-surface-2 text-m-ink-3">
                <UserRound className="size-7" />
              </span>
            )}
            <button type="button" onClick={openFilePicker} disabled={uploading !== null} className="m-chip h-9 px-3.5 text-[13px]">
              {uploading === 'photo' ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading === 'photo' ? 'Uploading…' : photo ? 'Change photo' : 'Add photo'}
            </button>
          </div>
        )}
      </ImageUploadField>

      <div>
        <FieldLabel>Candidate name</FieldLabel>
        <input value={form.name} onChange={(e) => set('name', e.target.value.slice(0, 200))} className="m-field px-3" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Date of birth</FieldLabel>
          <input type="date" value={form.dob} max={today} onChange={(e) => set('dob', e.target.value)} className="m-field px-3" />
        </div>
        <div>
          <FieldLabel>Gender</FieldLabel>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="m-field px-3">
            <option value="">Select</option>
            {Gender.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel hint="Optional">Qualification</FieldLabel>
        <input
          value={form.qualification}
          onChange={(e) => set('qualification', e.target.value.slice(0, 200))}
          placeholder="e.g. B.Com, CA, MBBS"
          className="m-field px-3"
        />
      </div>

      <div>
        <FieldLabel hint="Image, up to 3 MB">Biodata</FieldLabel>
        <ImageUploadField fieldKey="biodata" onFileReady={(f) => handleUpload('biodata', f)} onError={setError}>
          {({ openFilePicker }) => (
            <div className="flex items-center gap-3">
              {biodata ? (
                <ClickableImage src={biodata} alt="Biodata" className="size-16 rounded-xl object-cover ring-1 ring-m-line" />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-xl bg-m-surface-2 text-m-ink-3">
                  <FileImage className="size-6" />
                </span>
              )}
              <button type="button" onClick={openFilePicker} disabled={uploading !== null} className="m-chip h-9 px-3.5 text-[13px]">
                {uploading === 'biodata' ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading === 'biodata' ? 'Uploading…' : biodata ? 'Replace' : 'Upload biodata'}
              </button>
            </div>
          )}
        </ImageUploadField>
      </div>

      {error && <p className="text-sm text-m-danger">{error}</p>}

      <button type="submit" disabled={!form.name.trim() || submitting || uploading !== null} className="m-primary-btn">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Send for approval
      </button>
    </form>
  );
}

export function AddMatrimonialSheet({ open, onOpenChange, user, onSubmitted }: Props) {
  return (
    <FeedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add matrimonial candidate"
      description="Name, photo, biodata and basic details"
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
