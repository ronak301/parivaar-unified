'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uploadUserPhoto, uploadBusinessLogo, uploadBusinessPhoto } from '@/lib/firebase/storage';
import type { UserData, FamilyTreeMember } from './member-detail-types';
import {
  PersonFieldsBlock,
  emptyPersonForm,
  emptyBusinessForm,
  buildUserPayload,
  buildBusinessPayload,
  type PersonForm,
  type BusinessForm,
} from './person-fields-block';

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  member: UserData;
  familyMembers: FamilyTreeMember[];
  onAdded: () => void;
}

const RELATIONS = [
  { id: 'son', label: 'Son' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'spouse', label: 'Spouse' },
];

export function AddFamilyMemberDialog({ open, onOpenChange, communityId, member, familyMembers, onAdded }: AddFamilyMemberDialogProps) {
  const [relation, setRelation] = useState('');
  const [relativeId, setRelativeId] = useState(member._id);

  const relativeOptions = [
    { _id: member._id, firstName: member.firstName, lastName: member.lastName, fullName: member.fullName },
    ...familyMembers.filter((m) => m._id !== member._id),
  ];

  const [form, setForm] = useState<PersonForm>(emptyPersonForm());
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [businessEnabled, setBusinessEnabled] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>(emptyBusinessForm());
  const [uploadingBusiness, setUploadingBusiness] = useState(false);
  const [businessLogoPrev, setBusinessLogoPrev] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>();
  const [businessPhotosPrev, setBusinessPhotosPrev] = useState<string[]>([]);
  const [businessPhotoUrls, setBusinessPhotoUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setRelation('');
    setRelativeId(member._id);
    setForm(emptyPersonForm());
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setPhotoUrl(undefined);
    setUploadingPhoto(false);
    setBusinessEnabled(false);
    setBusinessForm(emptyBusinessForm());
    if (businessLogoPrev) URL.revokeObjectURL(businessLogoPrev);
    setBusinessLogoPrev('');
    setBusinessLogoUrl(undefined);
    businessPhotosPrev.forEach((url) => URL.revokeObjectURL(url));
    setBusinessPhotosPrev([]);
    setBusinessPhotoUrls([]);
    setUploadingBusiness(false);
    setError('');
  }

  useEffect(() => {
    if (!open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function setField<K extends keyof PersonForm>(key: K, value: PersonForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBusinessField<K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) {
    setBusinessForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoFileReady(file: File) {
    setError('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);

    uploadUserPhoto(file, `temp/${communityId}/${crypto.randomUUID()}`)
      .then((url) => setPhotoUrl(url))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload photo'))
      .finally(() => setUploadingPhoto(false));
  }

  function handleBusinessLogoFileReady(file: File) {
    setError('');
    if (businessLogoPrev) URL.revokeObjectURL(businessLogoPrev);
    const preview = URL.createObjectURL(file);
    setBusinessLogoPrev(preview);
    setUploadingBusiness(true);

    uploadBusinessLogo(file, `temp/${communityId}/${crypto.randomUUID()}`)
      .then((url) => setBusinessLogoUrl(url))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload logo'))
      .finally(() => setUploadingBusiness(false));
  }

  function handleBusinessPhotoFileReady(file: File) {
    setError('');
    if (businessPhotosPrev.length >= 2) return;
    const preview = URL.createObjectURL(file);
    setBusinessPhotosPrev((prev) => [...prev, preview].slice(0, 2));
    setUploadingBusiness(true);

    uploadBusinessPhoto(file, `temp/${communityId}/${crypto.randomUUID()}`)
      .then((url) => setBusinessPhotoUrls((prev) => [...prev, url].slice(0, 2)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload photo'))
      .finally(() => setUploadingBusiness(false));
  }

  async function handleSubmit() {
    if (!relation) {
      setError('Please select a relation');
      return;
    }
    if (!relativeId) {
      setError('Please select who this member is related to');
      return;
    }
    if (!form.firstName.trim()) {
      setError('Enter a first name');
      return;
    }
    if (!form.gender) {
      setError('Gender is required');
      return;
    }
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) {
      setError('Pincode must be 6 digits');
      return;
    }
    if (form.aadharLast4 && !/^[0-9]{4}$/.test(form.aadharLast4)) {
      setError('Aadhar must be last 4 digits');
      return;
    }
    if (businessEnabled && !businessForm.name.trim()) {
      setError('Business name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let familyId = member.familyId?._id;

      if (!familyId) {
        const famRes = await fetch('/api/admin/families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headId: member._id,
            communityIds: (member.communityIds ?? []).map((c) => c._id),
          }),
        });
        const famData = await famRes.json();
        if (!famRes.ok) {
          setError(famData.error || 'Failed to create family');
          return;
        }
        familyId = famData.family._id;
      }

      const payload = buildUserPayload(form, photoUrl, communityId);
      const userRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setError(userData.error || 'Failed to create member');
        return;
      }
      const userId = userData.user._id;

      if (businessEnabled && businessForm.name.trim()) {
        const businessPayload = {
          ...buildBusinessPayload(businessForm, businessLogoUrl, businessPhotoUrls),
          ownerId: userId,
          communityId,
        };
        const bizRes = await fetch('/api/admin/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(businessPayload),
        });
        const bizData = await bizRes.json();
        if (!bizRes.ok) {
          setError(bizData.error || 'Member created, but failed to save business');
          return;
        }
      }

      const addRes = await fetch(`/api/admin/families/${familyId}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, relation, relativeId }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || 'Failed to add family member');
        return;
      }

      onOpenChange(false);
      onAdded();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Relation <span className="text-red-500">*</span></Label>
              <Select value={relation} onValueChange={(v) => setRelation(v ?? '')}>
                <SelectTrigger className="w-full">
                  {relation
                    ? <span data-slot="select-value" className="flex flex-1 text-left">{RELATIONS.find((r) => r.id === relation)?.label}</span>
                    : <SelectValue placeholder="Select relation" />
                  }
                </SelectTrigger>
                <SelectContent>
                  {RELATIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs">Related to <span className="text-red-500">*</span></Label>
              <Select value={relativeId} onValueChange={(v) => setRelativeId(v ?? '')}>
                <SelectTrigger className="w-full">
                  {relativeId
                    ? (
                      <span data-slot="select-value" className="flex flex-1 text-left">
                        {(() => {
                          const r = relativeOptions.find((o) => o._id === relativeId);
                          return r?.fullName || `${r?.firstName ?? ''} ${r?.lastName ?? ''}`.trim();
                        })()}
                      </span>
                    )
                    : <SelectValue placeholder="Select family member" />
                  }
                </SelectTrigger>
                <SelectContent>
                  {relativeOptions.map((o) => (
                    <SelectItem key={o._id} value={o._id}>
                      {o.fullName || `${o.firstName} ${o.lastName ?? ''}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {relation && relativeId && form.firstName.trim() && (
            <p className="text-xs text-muted-foreground -mt-3">
              ({form.firstName.trim()} is {RELATIONS.find((r) => r.id === relation)?.label.toLowerCase()} of{' '}
              {(() => {
                const r = relativeOptions.find((o) => o._id === relativeId);
                return r?.fullName || `${r?.firstName ?? ''} ${r?.lastName ?? ''}`.trim();
              })()})
            </p>
          )}

          <PersonFieldsBlock
            form={form}
            setField={setField}
            photoPreview={photoPreview}
            onPhotoFileReady={handlePhotoFileReady}
            uploadingPhoto={uploadingPhoto}
            businessEnabled={businessEnabled}
            onToggleBusiness={() => setBusinessEnabled((v) => !v)}
            businessForm={businessForm}
            setBusinessField={setBusinessField}
            businessLogoPrev={businessLogoPrev}
            businessPhotosPrev={businessPhotosPrev}
            onBusinessLogoFileReady={handleBusinessLogoFileReady}
            onBusinessPhotoFileReady={handleBusinessPhotoFileReady}
            uploadingBusiness={uploadingBusiness}
            onError={setError}
            showSampradaya={false}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving} className="bg-[#3230c4] hover:bg-[#494ad9]">
            {saving ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
