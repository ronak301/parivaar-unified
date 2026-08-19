'use client';

import { useEffect, useState } from 'react';
import type { Business } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { uploadUserPhoto, uploadBusinessLogo, uploadBusinessPhoto } from '@/lib/firebase/storage';
import type { UserData } from './member-detail-types';
import {
  PersonFieldsBlock,
  emptyPersonForm,
  emptyBusinessForm,
  buildUserPayload,
  buildBusinessPayload,
  type PersonForm,
  type BusinessForm,
} from './person-fields-block';

interface EditMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  user: UserData;
  onSaved: () => void;
  localities?: string[];
}

function buildFormState(u: UserData): PersonForm {
  return {
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    phone: u.phone || '',
    email: u.email || '',
    dob: u.dob ? u.dob.slice(0, 10) : '',
    guardianName: u.guardianName || '',
    nativePlace: u.nativePlace || '',
    nativeDistrict: u.nativeDistrict || '',
    nanihaal: u.nanihaal || '',
    gender: u.gender || '',
    weddingDate: u.weddingDate ? u.weddingDate.slice(0, 10) : '',
    education: u.education || '',
    specialEducation: u.specialEducation || '',
    bloodGroup: u.bloodGroup || '',
    hobbies: u.hobbies || '',
    achievements: u.achievements || '',
    aadharLast4: u.aadharLast4 || '',
    sampradaya: '',
    fullAddress: u.address?.fullAddress || '',
    state: u.address?.state || '',
    city: u.address?.city || '',
    district: u.address?.district || '',
    locality: u.address?.locality || '',
    pincode: u.address?.pincode || '',
  };
}

function buildBusinessFormState(b: Business | null): BusinessForm {
  if (!b) return emptyBusinessForm();
  return {
    name: b.name || '',
    category: b.category || '',
    phone: b.phone || '',
    website: b.website || '',
    description: b.description || '',
    address: b.address || '',
    instagramProfile: b.instagramProfile || '',
    linkedinProfile: b.linkedinProfile || '',
    googleMapsLink: b.googleMapsLink || '',
    logo: b.logo || '',
    photos: b.photos || [],
  };
}

export function EditMemberSheet({ open, onOpenChange, memberId, user, onSaved, localities = [] }: EditMemberSheetProps) {
  const [form, setForm] = useState<PersonForm>(() => buildFormState(user));
  const [photoPreview, setPhotoPreview] = useState(user.profilePicture || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user.profilePicture);

  const [existingBusinessId, setExistingBusinessId] = useState<string | null>(null);
  const [businessEnabled, setBusinessEnabled] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>(emptyBusinessForm());
  const [uploadingBusiness, setUploadingBusiness] = useState(false);
  const [businessLogoPrev, setBusinessLogoPrev] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>();
  const [businessPhotosPrev, setBusinessPhotosPrev] = useState<string[]>([]);
  const [businessPhotoUrls, setBusinessPhotoUrls] = useState<string[]>([]);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(buildFormState(user));
    setPhotoPreview(user.profilePicture || '');
    setPhotoUrl(user.profilePicture);
    setError('');

    setLoadingBusiness(true);
    fetch(`/api/admin/businesses/owner/${memberId}`)
      .then((res) => res.json())
      .then((data) => {
        const business: Business | null = data.business ?? null;
        setExistingBusinessId(business?._id ?? null);
        setBusinessEnabled(!!business);
        setBusinessForm(buildBusinessFormState(business));
        setBusinessLogoPrev(business?.logo || '');
        setBusinessLogoUrl(business?.logo || undefined);
        setBusinessPhotosPrev(business?.photos || []);
        setBusinessPhotoUrls(business?.photos || []);
      })
      .catch(() => {
        setExistingBusinessId(null);
        setBusinessEnabled(false);
        setBusinessForm(emptyBusinessForm());
        setBusinessLogoPrev('');
        setBusinessLogoUrl(undefined);
        setBusinessPhotosPrev([]);
        setBusinessPhotoUrls([]);
      })
      .finally(() => setLoadingBusiness(false));
  }, [open, user, memberId]);

  function setField<K extends keyof PersonForm>(key: K, value: PersonForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBusinessField<K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) {
    setBusinessForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoFileReady(file: File) {
    setError('');
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);

    uploadUserPhoto(file, `users/${memberId}/${crypto.randomUUID()}`)
      .then((url) => setPhotoUrl(url))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload photo'))
      .finally(() => setUploadingPhoto(false));
  }

  function handleBusinessLogoFileReady(file: File) {
    setError('');
    if (businessLogoPrev && businessLogoPrev.startsWith('blob:')) URL.revokeObjectURL(businessLogoPrev);
    const preview = URL.createObjectURL(file);
    setBusinessLogoPrev(preview);
    setUploadingBusiness(true);

    uploadBusinessLogo(file, `users/${memberId}/${crypto.randomUUID()}`)
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

    uploadBusinessPhoto(file, `users/${memberId}/${crypto.randomUUID()}`)
      .then((url) => setBusinessPhotoUrls((prev) => [...prev, url].slice(0, 2)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload photo'))
      .finally(() => setUploadingBusiness(false));
  }

  async function handleSave() {
    if (!form.firstName.trim()) {
      setError('First name is required');
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
      const payload = buildUserPayload(form, photoUrl);
      const res = await fetch(`/api/admin/users/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update');
        return;
      }

      if (businessEnabled && businessForm.name.trim()) {
        const businessPayload = buildBusinessPayload(businessForm, businessLogoUrl, businessPhotoUrls);
        if (existingBusinessId) {
          const bizRes = await fetch(`/api/admin/businesses/${existingBusinessId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(businessPayload),
          });
          const bizData = await bizRes.json();
          if (!bizRes.ok) {
            setError(bizData.error || 'Member updated, but failed to save business');
            return;
          }
        } else {
          const communityId = user.communityIds?.[0]?._id;
          const bizRes = await fetch('/api/admin/businesses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...businessPayload, ownerId: memberId, communityId }),
          });
          const bizData = await bizRes.json();
          if (!bizRes.ok) {
            setError(bizData.error || 'Member updated, but failed to save business');
            return;
          }
        }
      }

      onOpenChange(false);
      onSaved();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-1/2 data-[side=right]:sm:max-w-[50vw]">
        <SheetHeader>
          <SheetTitle>Edit Member</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <PersonFieldsBlock
            form={form}
            setField={setField}
            photoPreview={photoPreview}
            onPhotoFileReady={handlePhotoFileReady}
            uploadingPhoto={uploadingPhoto}
            localities={localities}
            businessEnabled={businessEnabled}
            onToggleBusiness={() => setBusinessEnabled((v) => !v)}
            businessForm={businessForm}
            setBusinessField={setBusinessField}
            businessLogoPrev={businessLogoPrev}
            businessPhotosPrev={businessPhotosPrev}
            onBusinessLogoFileReady={handleBusinessLogoFileReady}
            onBusinessPhotoFileReady={handleBusinessPhotoFileReady}
            uploadingBusiness={uploadingBusiness || loadingBusiness}
            onError={setError}
            showSampradaya={false}
          />
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={saving} className="bg-[#3230c4] hover:bg-[#494ad9]">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
