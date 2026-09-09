'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User, Business } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { flattenLocalities, localitiesForCity } from '@/lib/localities';
import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { ClickableAvatar } from '@/components/ui/clickable-image';
import { UserRound, Upload, Store } from 'lucide-react';
import { states, getCitiesForState, getDistrictsForState } from '@/lib/locations';
import { uploadUserPhoto } from '@/lib/firebase/storage';
import { extractApiErrorMessage } from '@/lib/api/error-message';
import { CheckCircle2 } from 'lucide-react';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  guardianName: string;
  gender: string;
  weddingDate: string;
  education: string;
  specialEducation: string;
  bloodGroup: string;
  hobbies: string;
  achievements: string;
  aadharLast4: string;
  nativePlace: string;
  nativeDistrict: string;
  nanihaal: string;
  fullAddress: string;
  state: string;
  city: string;
  district: string;
  pincode: string;
  locality: string;
}

function toFormState(user: User): FormState {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    dob: user.dob ? user.dob.slice(0, 10) : '',
    guardianName: user.guardianName ?? '',
    gender: user.gender ?? '',
    weddingDate: user.weddingDate ? user.weddingDate.slice(0, 10) : '',
    education: user.education ?? '',
    specialEducation: user.specialEducation ?? '',
    bloodGroup: user.bloodGroup ?? '',
    hobbies: user.hobbies ?? '',
    achievements: user.achievements ?? '',
    aadharLast4: user.aadharLast4 ?? '',
    nativePlace: user.nativePlace ?? '',
    nativeDistrict: user.nativeDistrict ?? '',
    nanihaal: user.nanihaal ?? '',
    fullAddress: user.address?.fullAddress ?? '',
    state: user.address?.state ?? '',
    city: user.address?.city ?? '',
    district: user.address?.district ?? '',
    pincode: user.address?.pincode ?? '',
    locality: user.address?.locality ?? '',
  };
}

function buildPayload(form: FormState, profilePicture: string | undefined) {
  const hasAddress =
    form.fullAddress || form.locality || form.state || form.city || form.district || form.pincode;

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim() || undefined,
    profilePicture,
    email: form.email || undefined,
    dob: form.dob || undefined,
    guardianName: form.guardianName || undefined,
    gender: form.gender || undefined,
    weddingDate: form.weddingDate || undefined,
    education: form.education || undefined,
    specialEducation: form.specialEducation || undefined,
    bloodGroup: form.bloodGroup || undefined,
    hobbies: form.hobbies || undefined,
    achievements: form.achievements || undefined,
    aadharLast4: form.aadharLast4 || undefined,
    nativePlace: form.nativePlace || undefined,
    nativeDistrict: form.nativeDistrict || undefined,
    nanihaal: form.nanihaal || undefined,
    address: hasAddress
      ? {
          fullAddress: form.fullAddress || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          district: form.district || undefined,
          pincode: form.pincode || undefined,
          locality: form.locality || undefined,
        }
      : undefined,
  };
}

interface BusinessFormState {
  name: string;
  category: string;
  phone: string;
  description: string;
  address: string;
  website: string;
  googleMapsLink: string;
}

function toBusinessForm(b: Business | null): BusinessFormState {
  return {
    name: b?.name ?? '',
    category: b?.category ?? '',
    phone: b?.phone ?? '',
    description: b?.description ?? '',
    address: b?.address ?? '',
    website: b?.website ?? '',
    googleMapsLink: b?.googleMapsLink ?? '',
  };
}

interface EditProfileFormProps {
  user: User;
  /** Short-lived token from OTP re-verification; required by the backend. */
  actionToken: string;
}

export function EditProfileForm({ user, actionToken }: EditProfileFormProps) {
  const router = useRouter();
  const { user: authUser } = useMemberAuth();
  const [form, setForm] = useState<FormState>(() => toFormState(user));
  const [photoPreview, setPhotoPreview] = useState(user.profilePicture ?? '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [communityLocalities, setCommunityLocalities] = useState<Record<string, string[]>>({});

  const [business, setBusiness] = useState<Business | null>(null);
  const [businessForm, setBusinessForm] = useState<BusinessFormState>(toBusinessForm(null));
  const [savingBusiness, setSavingBusiness] = useState(false);

  useEffect(() => {
    const cid = authUser?.communityIds?.[0];
    if (!cid) return;
    fetch(`/api/member/community/${cid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.community?.localities && typeof d.community.localities === 'object' && !Array.isArray(d.community.localities)) {
          setCommunityLocalities(d.community.localities);
        }
      })
      .catch(() => {});
  }, [authUser]);

  useEffect(() => {
    fetch(`/api/member/business/owner/${user._id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.business) {
          setBusiness(d.business);
          setBusinessForm(toBusinessForm(d.business));
        }
      })
      .catch(() => {});
  }, [user._id]);

  const availableLocalities = form.city
    ? localitiesForCity(communityLocalities, form.city)
    : flattenLocalities(communityLocalities);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoFile(file: File) {
    setUploadingPhoto(true);
    try {
      const url = await uploadUserPhoto(file, user._id);
      setPhotoPreview(url);
    } catch {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function setBusinessField<K extends keyof BusinessFormState>(key: K, value: BusinessFormState[K]) {
    setBusinessForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/member/profile-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: buildPayload(form, photoPreview || undefined), actionToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(extractApiErrorMessage(data, 'Failed to submit changes'));
        return;
      }

      if (business) {
        setSavingBusiness(true);
        try {
          const bRes = await fetch(`/api/member/business/${business._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: businessForm.name || undefined,
              category: businessForm.category || undefined,
              phone: businessForm.phone || undefined,
              description: businessForm.description || undefined,
              address: businessForm.address || undefined,
              website: businessForm.website || undefined,
              googleMapsLink: businessForm.googleMapsLink || undefined,
            }),
          });
          if (!bRes.ok) {
            const bData = await bRes.json();
            setError(extractApiErrorMessage(bData, 'Profile saved but business update failed'));
            return;
          }
        } finally {
          setSavingBusiness(false);
        }
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-lg font-bold">Changes submitted</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Your community admin will review them shortly. Your profile will update automatically once approved.
        </p>
        <Button className="mt-3 h-11 w-full max-w-xs" onClick={() => router.push('/m/profile')}>
          Back to profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        Edits are sent to your community admin for approval and will appear on your profile once approved.
      </p>
      <ImageUploadField fieldKey="profilePhoto" onFileReady={handlePhotoFile} onError={setError}>
        {({ openFilePicker }) => (
          <div className="flex flex-col items-center gap-3">
            <ClickableAvatar
              src={photoPreview}
              alt="Profile photo"
              fallback={<UserRound className="size-12" />}
              className="size-24"
            />
            <Button type="button" variant="outline" size="sm" onClick={openFilePicker} disabled={uploadingPhoto}>
              <Upload className="size-3.5" />
              {uploadingPhoto ? 'Uploading...' : 'Change photo'}
            </Button>
          </div>
        )}
      </ImageUploadField>

      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-phone">Phone</Label>
          <Input id="ep-phone" value={user.phone ?? ''} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-firstName">First name</Label>
          <Input id="ep-firstName" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-lastName">Last name</Label>
          <Input id="ep-lastName" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-email">Email</Label>
          <Input id="ep-email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-dob">Date of birth</Label>
          <Input id="ep-dob" type="date" value={form.dob} onChange={(e) => setField('dob', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-guardianName">Father&apos;s / Guardian Name</Label>
          <Input
            id="ep-guardianName"
            value={form.guardianName}
            onChange={(e) => setField('guardianName', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-gender">Gender</Label>
          <Select value={form.gender} onValueChange={(v) => setField('gender', v ?? '')}>
            <SelectTrigger id="ep-gender" className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {Gender.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-weddingDate">Wedding date</Label>
          <Input
            id="ep-weddingDate"
            type="date"
            value={form.weddingDate}
            onChange={(e) => setField('weddingDate', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-education">Education</Label>
          <Input id="ep-education" value={form.education} onChange={(e) => setField('education', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-specialEducation">Special education</Label>
          <Input
            id="ep-specialEducation"
            value={form.specialEducation}
            onChange={(e) => setField('specialEducation', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-bloodGroup">Blood group</Label>
          <Select value={form.bloodGroup} onValueChange={(v) => setField('bloodGroup', v ?? '')}>
            <SelectTrigger id="ep-bloodGroup" className="w-full">
              <SelectValue placeholder="Select blood group">
                {(value: string) => BloodGroups.find((bg) => bg.id === value)?.label ?? value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BloodGroups.map((bg) => (
                <SelectItem key={bg.id} value={bg.id}>
                  {bg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-hobbies">Hobbies</Label>
          <Input id="ep-hobbies" value={form.hobbies} onChange={(e) => setField('hobbies', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-achievements">Achievements</Label>
          <Input
            id="ep-achievements"
            value={form.achievements}
            onChange={(e) => setField('achievements', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-aadhar">Aadhar (last 4 digits)</Label>
          <Input
            id="ep-aadhar"
            maxLength={4}
            value={form.aadharLast4}
            onChange={(e) => setField('aadharLast4', e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-nativePlace">Native place</Label>
          <Input
            id="ep-nativePlace"
            value={form.nativePlace}
            onChange={(e) => setField('nativePlace', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-nativeDistrict">Native district</Label>
          <Input
            id="ep-nativeDistrict"
            value={form.nativeDistrict}
            onChange={(e) => setField('nativeDistrict', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-nanihaal">Nanihaal Gotra</Label>
          <Input id="ep-nanihaal" value={form.nanihaal} onChange={(e) => setField('nanihaal', e.target.value)} />
        </div>

        {business && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <Store className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Business Info</h3>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizName">Business name</Label>
              <Input id="ep-bizName" value={businessForm.name} onChange={(e) => setBusinessField('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizCategory">Category</Label>
              <Select value={businessForm.category} onValueChange={(v) => setBusinessField('category', v ?? '')}>
                <SelectTrigger id="ep-bizCategory" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BusinessTypes.map((bt) => (
                    <SelectItem key={bt.id} value={bt.id}>{bt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizPhone">Business phone</Label>
              <Input id="ep-bizPhone" value={businessForm.phone} onChange={(e) => setBusinessField('phone', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizDesc">Description</Label>
              <Textarea id="ep-bizDesc" rows={2} value={businessForm.description} onChange={(e) => setBusinessField('description', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizAddress">Business address</Label>
              <Input id="ep-bizAddress" value={businessForm.address} onChange={(e) => setBusinessField('address', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizWebsite">Website</Label>
              <Input id="ep-bizWebsite" type="url" value={businessForm.website} onChange={(e) => setBusinessField('website', e.target.value)} placeholder="https://" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-bizMaps">Google Maps link</Label>
              <Input id="ep-bizMaps" type="url" value={businessForm.googleMapsLink} onChange={(e) => setBusinessField('googleMapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-fullAddress">Full address</Label>
          <Textarea
            id="ep-fullAddress"
            rows={2}
            value={form.fullAddress}
            onChange={(e) => setField('fullAddress', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-state">State</Label>
          <Select
            value={form.state}
            onValueChange={(v) => {
              setField('state', v ?? '');
              setField('city', '');
              setField('district', '');
            }}
          >
            <SelectTrigger id="ep-state" className="w-full">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-city">City</Label>
          <Select value={form.city} onValueChange={(v) => setField('city', v ?? '')} disabled={!form.state}>
            <SelectTrigger id="ep-city" className="w-full">
              <SelectValue placeholder={form.state ? 'Select city' : 'Select state first'} />
            </SelectTrigger>
            <SelectContent>
              {form.state &&
                getCitiesForState(form.state).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-district">District</Label>
          <Select
            value={form.district}
            onValueChange={(v) => setField('district', v ?? '')}
            disabled={!form.state || getDistrictsForState(form.state).length === 0}
          >
            <SelectTrigger id="ep-district" className="w-full">
              <SelectValue
                placeholder={
                  !form.state
                    ? 'Select state first'
                    : getDistrictsForState(form.state).length === 0
                      ? 'Not available'
                      : 'Select district'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {form.state &&
                getDistrictsForState(form.state).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Locality</Label>
          {availableLocalities.length > 0 ? (
            <Select value={form.locality ?? ''} onValueChange={(v) => setField('locality', v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select locality" />
              </SelectTrigger>
              <SelectContent>
                {availableLocalities.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={form.locality} onChange={(e) => setField('locality', e.target.value)} placeholder="Locality" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ep-pincode">Pincode</Label>
          <Input id="ep-pincode" value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="h-11" disabled={saving || savingBusiness || !form.firstName.trim()}>
        {saving || savingBusiness ? 'Submitting…' : 'Submit for Approval'}
      </Button>
    </form>
  );
}
