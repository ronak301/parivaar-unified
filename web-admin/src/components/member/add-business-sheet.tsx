'use client';

import { useState } from 'react';
import { Loader2, Store, Upload } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { BusinessTypes, ExcludeBusinessTypes } from '@parivaar/shared';
import { extractApiErrorMessage } from '@/lib/api/error-message';
import { uploadBusinessLogo } from '@/lib/firebase/storage';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { FeedSheet, FieldLabel, SubmittedState } from './feed-sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmitted?: () => void;
}

const CATEGORIES = BusinessTypes.filter((bt) => !ExcludeBusinessTypes.includes(bt.id));

function normalizeUrl(v: string): string | undefined {
  const t = v.trim();
  if (!t) return undefined;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function Body({ user, onDone }: { user: User; onDone: () => void }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    phone: '',
    description: '',
    address: '',
    website: '',
    googleMapsLink: '',
  });
  const [logo, setLogo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleLogo(file: File) {
    setUploading(true);
    setError('');
    try {
      setLogo(await uploadBusinessLogo(file, user._id));
    } catch {
      setError('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/member/business/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category || undefined,
          phone: form.phone.trim() || undefined,
          description: form.description.trim() || undefined,
          address: form.address.trim() || undefined,
          website: normalizeUrl(form.website),
          googleMapsLink: normalizeUrl(form.googleMapsLink),
          logo: logo || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(extractApiErrorMessage(json, 'Failed to submit business'));
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
        title="Business sent for approval"
        body="After the admin approves, it will be listed in the directory and announced in the feed."
        onDone={onDone}
      />
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pt-2">
      <ImageUploadField fieldKey="businessLogo" onFileReady={handleLogo} onError={setError}>
        {({ openFilePicker }) => (
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="" className="size-16 rounded-xl object-cover ring-1 ring-m-line" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-xl bg-m-surface-2 text-m-ink-3">
                <Store className="size-6" />
              </span>
            )}
            <button type="button" onClick={openFilePicker} disabled={uploading} className="m-chip h-9 px-3.5 text-[13px]">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? 'Uploading…' : logo ? 'Replace logo' : 'Add logo (optional)'}
            </button>
          </div>
        )}
      </ImageUploadField>

      <div>
        <FieldLabel>Business name</FieldLabel>
        <input value={form.name} onChange={(e) => set('name', e.target.value.slice(0, 200))} className="m-field px-3" required />
      </div>

      <div>
        <FieldLabel>Category</FieldLabel>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="m-field px-3">
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel hint="Optional">Business phone</FieldLabel>
        <input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value.replace(/[^\d+ ]/g, '').slice(0, 15))}
          inputMode="tel"
          placeholder="Defaults to your profile number"
          className="m-field px-3"
        />
      </div>

      <div>
        <FieldLabel hint={`${form.description.length}/1000`}>Description</FieldLabel>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value.slice(0, 1000))}
          placeholder="What do you offer?"
          className="m-textarea"
          rows={3}
        />
      </div>

      <div>
        <FieldLabel hint="Optional">Address</FieldLabel>
        <input value={form.address} onChange={(e) => set('address', e.target.value.slice(0, 500))} className="m-field px-3" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <FieldLabel hint="Optional">Website</FieldLabel>
          <input value={form.website} onChange={(e) => set('website', e.target.value.slice(0, 500))} inputMode="url" placeholder="example.com" className="m-field px-3" />
        </div>
        <div>
          <FieldLabel hint="Optional">Google Maps link</FieldLabel>
          <input value={form.googleMapsLink} onChange={(e) => set('googleMapsLink', e.target.value.slice(0, 500))} inputMode="url" className="m-field px-3" />
        </div>
      </div>

      {error && <p className="text-sm text-m-danger">{error}</p>}

      <button type="submit" disabled={!form.name.trim() || submitting || uploading} className="m-primary-btn">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Send for approval
      </button>
    </form>
  );
}

export function AddBusinessSheet({ open, onOpenChange, user, onSubmitted }: Props) {
  return (
    <FeedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add my business"
      description="Listed in the directory once approved"
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
