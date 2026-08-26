'use client';

import { useRef, useState } from 'react';
import type { Community } from '@parivaar/shared';
import { CommunityStatus } from '@parivaar/shared';
import {
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Select,
  Textarea,
  createListCollection,
} from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { ClickableAvatar } from '@/components/ui/clickable-image';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Building2, Pencil } from 'lucide-react';
import { uploadCommunityLogo } from '@/lib/firebase/storage';

const statusCollection = createListCollection({
  items: CommunityStatus.map((s) => ({ label: s.label, value: s.id })),
});

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
  const scopeRef = useRef<HTMLDivElement>(null);

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
    <div className="chakra-scope" ref={scopeRef}>
      <Dialog.Root
        lazyMount
        open={open}
        onOpenChange={(e) => {
          setOpen(e.open);
          if (!e.open) resetToSource();
        }}
      >
        <Dialog.Trigger asChild>
          <Button variant="outline" size="sm">
            <Pencil />
            Edit
          </Button>
        </Dialog.Trigger>
        <Portal container={scopeRef}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxH="88vh" maxW="2xl" overflowY="auto">
              <Dialog.Header>
                <Dialog.Title fontSize="xl">Edit Community</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body display="flex" flexDirection="column" gap="6">
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
                  <Field.Root>
                    <Field.Label>Name</Field.Label>
                    <Input
                      id="edit-name"
                      size="lg"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Status</Field.Label>
                    <Select.Root
                      collection={statusCollection}
                      value={form.status ? [form.status] : []}
                      onValueChange={(e) => set('status', e.value[0] ?? '')}
                      size="lg"
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger id="edit-status">
                          <Select.ValueText placeholder="Select status" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal container={scopeRef}>
                        <Select.Positioner>
                          <Select.Content>
                            {statusCollection.items.map((item) => (
                              <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Contact Person</Field.Label>
                    <Input
                      id="edit-contactPersonName"
                      size="lg"
                      value={form.contactPersonName}
                      onChange={(e) => set('contactPersonName', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Contact Number</Field.Label>
                    <Input
                      id="edit-contactPersonNumber"
                      size="lg"
                      value={form.contactPersonNumber}
                      onChange={(e) => set('contactPersonNumber', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>State</Field.Label>
                    <Input
                      id="edit-state"
                      size="lg"
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>City</Field.Label>
                    <Input
                      id="edit-city"
                      size="lg"
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                    />
                  </Field.Root>
                </div>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    id="edit-description"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={3}
                  />
                </Field.Root>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </Dialog.Body>

              <Dialog.Footer>
                <Button size="lg" onClick={handleSave} disabled={saving || !form.name.trim()}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  );
}
