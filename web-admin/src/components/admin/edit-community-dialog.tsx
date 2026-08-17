'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { CommunityStatus } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClickableAvatar } from '@/components/ui/clickable-image';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Pencil } from 'lucide-react';
import { uploadCommunityLogo } from '@/lib/firebase/storage';

export function EditCommunityDialog({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: community.name ?? '',
    description: community.description ?? '',
    logo: community.logo ?? '',
    contactPersonName: community.contactPersonName ?? '',
    contactPersonNumber: community.contactPersonNumber ?? '',
    state: community.state ?? '',
    city: community.city ?? '',
    status: community.status ?? '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetToSource() {
    setForm({
      name: community.name ?? '',
      description: community.description ?? '',
      logo: community.logo ?? '',
      contactPersonName: community.contactPersonName ?? '',
      contactPersonNumber: community.contactPersonNumber ?? '',
      state: community.state ?? '',
      city: community.city ?? '',
      status: community.status ?? '',
    });
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview('');
    setError('');
  }

  function handleFileReady(file: File) {
    setError('');
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      let logo = form.logo || undefined;
      if (logoFile) {
        try {
          logo = await uploadCommunityLogo(logoFile, community._id);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to upload logo');
          return;
        }
      }

      const res = await fetch(`/api/admin/communities/${community._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          logo,
          contactPersonName: form.contactPersonName || undefined,
          contactPersonNumber: form.contactPersonNumber || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          status: form.status || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save changes');
        return;
      }

      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(null);
      setLogoPreview('');
      onUpdated(data.community);
      setOpen(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetToSource();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil />
        Edit
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Community</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <ClickableAvatar
              src={logoPreview || form.logo}
              alt="Community logo"
              fallback={<Building2 className="size-12" />}
              size="lg"
              className="size-28 ring-4 ring-muted"
            />
            <ImageUploadField
              fieldKey="communityLogo"
              onFileReady={handleFileReady}
              onError={setError}
            >
              {({ openFilePicker }) => (
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="lg" onClick={openFilePicker}>
                    {logoFile ? 'Change logo' : 'Upload logo'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    PNG, JPEG or WEBP, up to 1MB. Uploaded when you save.
                  </span>
                </div>
              )}
            </ImageUploadField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name" className="text-base">Name</Label>
              <Input
                id="edit-name"
                className="h-11 text-base"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-status" className="text-base">Status</Label>
              <Select
                value={form.status || undefined}
                onValueChange={(value) => set('status', String(value))}
              >
                <SelectTrigger id="edit-status" size="lg" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CommunityStatus.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-contactPersonName" className="text-base">Contact Person</Label>
              <Input
                id="edit-contactPersonName"
                className="h-11 text-base"
                value={form.contactPersonName}
                onChange={(e) => set('contactPersonName', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-contactPersonNumber" className="text-base">Contact Number</Label>
              <Input
                id="edit-contactPersonNumber"
                className="h-11 text-base"
                value={form.contactPersonNumber}
                onChange={(e) => set('contactPersonNumber', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-state" className="text-base">State</Label>
              <Input
                id="edit-state"
                className="h-11 text-base"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-city" className="text-base">City</Label>
              <Input
                id="edit-city"
                className="h-11 text-base"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description" className="text-base">Description</Label>
            <Textarea
              id="edit-description"
              className="text-base"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button size="lg" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
