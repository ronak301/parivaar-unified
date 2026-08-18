'use client';

import { useState, useEffect } from 'react';
import type { Community } from '@parivaar/shared';
import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClickableAvatar, ClickableImage } from '@/components/ui/clickable-image';
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
import { UserPlus, Upload, Plus, UserRound, Phone } from 'lucide-react';
import { uploadUserPhoto, uploadBusinessLogo, uploadBusinessPhoto } from '@/lib/firebase/storage';
import { states, getCitiesForState, getDistrictsForState } from '@/lib/locations';

interface PersonForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  guardianName: string;
  nativePlace: string;
  nativeDistrict: string;
  nanihaal: string;
  gender: string;
  weddingDate: string;
  education: string;
  specialEducation: string;
  bloodGroup: string;
  hobbies: string;
  achievements: string;
  aadharLast4: string;
  sampradaya: string;
  fullAddress: string;
  state: string;
  city: string;
  district: string;
  locality: string;
  pincode: string;
}

interface BusinessForm {
  name: string;
  category: string;
  phone: string;
  website: string;
  description: string;
  address: string;
  instagramProfile: string;
  linkedinProfile: string;
  googleMapsLink: string;
  logo: string;
  photos: string[];
}

interface BusinessFiles {
  logo: File | null;
  photos: File[];
}

interface MemberEntry {
  _id: string;
  name: string;
  relationLabel?: string;
}

interface PendingMember {
  tempId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  relation: string;
  relatedTo: string;
}

const RELATIONS = [
  { id: 'son', label: 'Son' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'spouse', label: 'Spouse' },
];

function emptyPersonForm(): PersonForm {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    guardianName: '',
    nativePlace: '',
    nativeDistrict: '',
    nanihaal: '',
    gender: '',
    weddingDate: '',
    education: '',
    specialEducation: '',
    bloodGroup: '',
    hobbies: '',
    achievements: '',
    aadharLast4: '',
    sampradaya: '',
    fullAddress: '',
    state: 'Karnataka',
    city: 'Bengaluru',
    district: '',
    locality: '',
    pincode: '',
  };
}

function emptyBusinessForm(): BusinessForm {
  return {
    name: '',
    category: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    instagramProfile: '',
    linkedinProfile: '',
    googleMapsLink: '',
    logo: '',
    photos: [],
  };
}

function fullName(user: { firstName: string; lastName?: string }) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}

function buildUserPayload(form: PersonForm, profilePicture: string | undefined, communityId: string) {
  const hasAddress = form.fullAddress || form.locality || form.state || form.city || form.district || form.pincode;

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim() || undefined,
    profilePicture,
    phone: form.phone || undefined,
    email: form.email || undefined,
    dob: form.dob || undefined,
    guardianName: form.guardianName || undefined,
    nativePlace: form.nativePlace || undefined,
    nativeDistrict: form.nativeDistrict || undefined,
    nanihaal: form.nanihaal || undefined,
    gender: form.gender || undefined,
    weddingDate: form.weddingDate || undefined,
    education: form.education || undefined,
    specialEducation: form.specialEducation || undefined,
    bloodGroup: form.bloodGroup || undefined,
    hobbies: form.hobbies || undefined,
    achievements: form.achievements || undefined,
    aadharLast4: form.aadharLast4 || undefined,
    address: hasAddress
      ? {
          fullAddress: form.fullAddress || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          district: form.district || undefined,
          locality: form.locality || undefined,
          pincode: form.pincode || undefined,
        }
      : undefined,
    communityIds: [communityId],
  };
}

function PersonFieldsBlock({
  form,
  setField,
  photoPreview,
  onPhotoFileReady,
  uploadingPhoto,
  localities,
  phoneReadOnly,
  businessEnabled,
  onToggleBusiness,
  businessForm,
  setBusinessField,
  businessLogoPrev,
  businessPhotosPrev,
  onBusinessLogoFileReady,
  onBusinessPhotoFileReady,
  uploadingBusiness,
  onError,
}: {
  form: PersonForm;
  setField: <K extends keyof PersonForm>(key: K, value: PersonForm[K]) => void;
  photoPreview: string;
  onPhotoFileReady: (file: File) => void;
  uploadingPhoto?: boolean;
  localities: string[];
  phoneReadOnly?: boolean;
  businessEnabled: boolean;
  onToggleBusiness: () => void;
  businessForm: BusinessForm;
  setBusinessField: <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) => void;
  businessLogoPrev: string;
  businessPhotosPrev: string[];
  onBusinessLogoFileReady: (file: File) => void;
  onBusinessPhotoFileReady: (file: File) => void;
  uploadingBusiness?: boolean;
  onError?: (error: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ImageUploadField
        fieldKey="profilePhoto"
        onFileReady={onPhotoFileReady}
        onError={onError}
      >
        {({ openFilePicker, openWithFile }) => (
          <div
            className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) openWithFile(file);
            }}
            onClick={openFilePicker}
          >
            <ClickableAvatar
              src={photoPreview}
              alt="Profile photo"
              fallback={<UserRound className="size-24" />}
              className="size-56"
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                disabled={uploadingPhoto}
              >
                <Upload />
                {uploadingPhoto ? 'Uploading...' : photoPreview ? 'Change photo' : 'Upload photo'}
              </Button>
              <p className="text-xs text-muted-foreground">or drag and drop your photo here</p>
              <p className="text-xs text-muted-foreground">PNG, JPEG, WebP · Max 2MB</p>
            </div>
          </div>
        )}
      </ImageUploadField>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-firstName">
            First name <span className="text-red-500">*</span>
          </Label>
          <Input id="pf-firstName" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-lastName">
            Last name <span className="text-red-500">*</span>
          </Label>
          <Input id="pf-lastName" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-sampradaya">Sampradaya</Label>
          <Select value={form.sampradaya} onValueChange={(v) => setField('sampradaya', v ?? '')}>
            <SelectTrigger id="pf-sampradaya" className="w-full">
              <SelectValue placeholder="Select sampradaya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sthanak">Sthanak</SelectItem>
              <SelectItem value="Mandrimargi">Mandrimargi</SelectItem>
              <SelectItem value="Terapanthi">Terapanthi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-phone">Phone</Label>
          <Input id="pf-phone" value={form.phone} disabled={phoneReadOnly} onChange={(e) => setField('phone', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-email">Email</Label>
          <Input id="pf-email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-dob">Date of birth</Label>
          <Input id="pf-dob" type="date" value={form.dob} onChange={(e) => setField('dob', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-guardianName">Guardian name</Label>
          <Input
            id="pf-guardianName"
            value={form.guardianName}
            onChange={(e) => setField('guardianName', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-gender">Gender <span className="text-red-500">*</span></Label>
          <Select value={form.gender} onValueChange={(v) => setField('gender', v ?? '')}>
            <SelectTrigger id="pf-gender" className="w-full">
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
          <Label htmlFor="pf-weddingDate">Wedding date</Label>
          <Input
            id="pf-weddingDate"
            type="date"
            value={form.weddingDate}
            onChange={(e) => setField('weddingDate', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-education">Education</Label>
          <Input id="pf-education" value={form.education} onChange={(e) => setField('education', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-bloodGroup">Blood group</Label>
          <Select value={form.bloodGroup} onValueChange={(v) => setField('bloodGroup', v ?? '')}>
            <SelectTrigger id="pf-bloodGroup" className="w-full">
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {BloodGroups.map((bg) => (
                <SelectItem key={bg.id} value={bg.label}>
                  {bg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-nativePlace">Native place</Label>
          <Input
            id="pf-nativePlace"
            value={form.nativePlace}
            onChange={(e) => setField('nativePlace', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-nativeDistrict">Native district</Label>
          <Input
            id="pf-nativeDistrict"
            value={form.nativeDistrict}
            onChange={(e) => setField('nativeDistrict', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-nanihaal">Nanihaal Gotra</Label>
          <Input
            id="pf-nanihaal"
            value={form.nanihaal}
            onChange={(e) => setField('nanihaal', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-specialEducation">Special education</Label>
          <Input
            id="pf-specialEducation"
            value={form.specialEducation}
            onChange={(e) => setField('specialEducation', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-hobbies">Hobbies</Label>
          <Input
            id="pf-hobbies"
            value={form.hobbies}
            onChange={(e) => setField('hobbies', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-achievements">Achievements</Label>
          <Input
            id="pf-achievements"
            value={form.achievements}
            onChange={(e) => setField('achievements', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-aadharLast4">Aadhar (last 4 digits)</Label>
          <Input
            id="pf-aadharLast4"
            maxLength={4}
            value={form.aadharLast4}
            onChange={(e) => setField('aadharLast4', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">Address</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="pf-fullAddress">Full address</Label>
            <Input
              id="pf-fullAddress"
              value={form.fullAddress}
              onChange={(e) => setField('fullAddress', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-state">State</Label>
            <Select value={form.state} onValueChange={(v) => setField('state', v ?? '')}>
              <SelectTrigger id="pf-state" className="w-full">
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
            <Label htmlFor="pf-city">City</Label>
            <Select
              value={form.city}
              onValueChange={(v) => setField('city', v ?? '')}
              disabled={!form.state}
            >
              <SelectTrigger id="pf-city" className="w-full">
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
            <Label htmlFor="pf-district">District</Label>
            <Select
              value={form.district}
              onValueChange={(v) => setField('district', v ?? '')}
              disabled={!form.state || getDistrictsForState(form.state).length === 0}
            >
              <SelectTrigger id="pf-district" className="w-full">
                <SelectValue
                  placeholder={
                    !form.state
                      ? 'Select state first'
                      : getDistrictsForState(form.state).length === 0
                        ? 'Not available for this state'
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
            <Label htmlFor="pf-locality">Locality</Label>
            {localities.length > 0 ? (
              <Select value={form.locality} onValueChange={(v) => setField('locality', v ?? '')}>
                <SelectTrigger id="pf-locality" className="w-full">
                  <SelectValue placeholder="Select locality" />
                </SelectTrigger>
                <SelectContent>
                  {localities.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input id="pf-locality" value={form.locality} onChange={(e) => setField('locality', e.target.value)} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-pincode">Pincode</Label>
            <Input id="pf-pincode" value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        {!businessEnabled ? (
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onToggleBusiness}>
            <Plus />
            Add business
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Business</p>
              <Button type="button" variant="ghost" size="sm" onClick={onToggleBusiness}>
                Remove
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-name">
                  Business name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pf-biz-name"
                  value={businessForm.name}
                  onChange={(e) => setBusinessField('name', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-category">Category</Label>
                <Select
                  value={businessForm.category}
                  onValueChange={(v) => setBusinessField('category', v ?? '')}
                >
                  <SelectTrigger id="pf-biz-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BusinessTypes.map((bt) => (
                      <SelectItem key={bt.id} value={bt.id}>
                        {bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-phone">Business phone</Label>
                <Input
                  id="pf-biz-phone"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessField('phone', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-website">Website</Label>
                <Input
                  id="pf-biz-website"
                  placeholder="https://example.com"
                  value={businessForm.website}
                  onChange={(e) => setBusinessField('website', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="pf-biz-description">Description</Label>
                <Textarea
                  id="pf-biz-description"
                  rows={2}
                  value={businessForm.description}
                  onChange={(e) => setBusinessField('description', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="pf-biz-address">Address</Label>
                <Input
                  id="pf-biz-address"
                  value={businessForm.address}
                  onChange={(e) => setBusinessField('address', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-instagram">Instagram profile</Label>
                <Input
                  id="pf-biz-instagram"
                  placeholder="https://instagram.com/..."
                  value={businessForm.instagramProfile}
                  onChange={(e) => setBusinessField('instagramProfile', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-linkedin">LinkedIn profile</Label>
                <Input
                  id="pf-biz-linkedin"
                  placeholder="https://linkedin.com/..."
                  value={businessForm.linkedinProfile}
                  onChange={(e) => setBusinessField('linkedinProfile', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="pf-biz-gmaps">Google Maps link</Label>
                <Input
                  id="pf-biz-gmaps"
                  placeholder="https://maps.google.com/..."
                  value={businessForm.googleMapsLink}
                  onChange={(e) => setBusinessField('googleMapsLink', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  {businessLogoPrev && (
                    <ClickableImage src={businessLogoPrev} alt="Logo" className="size-10 rounded object-cover" />
                  )}
                  <ImageUploadField
                    fieldKey="businessLogo"
                    onFileReady={onBusinessLogoFileReady}
                    onError={onError}
                  >
                    {({ openFilePicker }) => (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openFilePicker}
                        disabled={uploadingBusiness}
                      >
                        <Upload className="size-3.5" />
                        {uploadingBusiness ? 'Uploading...' : businessLogoPrev ? 'Change' : 'Upload'}
                      </Button>
                    )}
                  </ImageUploadField>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Photos (max 2)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {businessPhotosPrev.map((url, idx) => (
                    <ClickableImage key={idx} src={url} alt={`Photo ${idx + 1}`} className="size-12 rounded object-cover" />
                  ))}
                </div>
                <ImageUploadField
                  fieldKey="businessPhoto"
                  onFileReady={onBusinessPhotoFileReady}
                  onError={onError}
                >
                  {({ openFilePicker }) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openFilePicker}
                      disabled={businessPhotosPrev.length >= 2 || uploadingBusiness}
                    >
                      <Upload className="size-3.5" />
                      {uploadingBusiness ? 'Uploading...' : 'Add photo'}
                    </Button>
                  )}
                </ImageUploadField>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface AddFamilyDialogProps {
  community: Community;
  onMemberAdded: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddFamilyDialog({
  community,
  onMemberAdded,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddFamilyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
  const isUncontrolled = controlledOpen === undefined;
  const [phase, setPhase] = useState<'phone' | 'head' | 'members'>('phone');

  const [form, setForm] = useState<PersonForm>(emptyPersonForm());
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [businessEnabled, setBusinessEnabled] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>(emptyBusinessForm());

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [memberFirstName, setMemberFirstName] = useState('');
  const [memberLastName, setMemberLastName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberGender, setMemberGender] = useState('');
  const [memberRelation, setMemberRelation] = useState('');
  const [memberRelatedTo, setMemberRelatedTo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingBusiness, setUploadingBusiness] = useState(false);
  const [businessLogoPrev, setBusinessLogoPrev] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>();
  const [businessPhotosPrev, setBusinessPhotosPrev] = useState<string[]>([]);
  const [businessPhotoUrls, setBusinessPhotoUrls] = useState<string[]>([]);

  const headName = [form.firstName, form.lastName].filter(Boolean).join(' ');

  useEffect(() => {
    if (!open) {
      setPhase('phone');
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
      setPendingMembers([]);
      setMemberFirstName('');
      setMemberLastName('');
      setMemberPhone('');
      setMemberGender('');
      setMemberRelation('');
      setMemberRelatedTo('');
      setError('');
    }
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

    uploadUserPhoto(file, `temp/${community._id}/${crypto.randomUUID()}`)
      .then((url) => {
        setPhotoUrl(url);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to upload photo');
      })
      .finally(() => setUploadingPhoto(false));
  }

  function handleBusinessLogoFileReady(file: File) {
    setError('');
    if (businessLogoPrev) URL.revokeObjectURL(businessLogoPrev);
    const preview = URL.createObjectURL(file);
    setBusinessLogoPrev(preview);
    setUploadingBusiness(true);

    uploadBusinessLogo(file, `temp/${community._id}/${crypto.randomUUID()}`)
      .then((url) => {
        setBusinessLogoUrl(url);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to upload logo');
      })
      .finally(() => setUploadingBusiness(false));
  }

  function handleBusinessPhotoFileReady(file: File) {
    setError('');
    if (businessPhotosPrev.length >= 2) return;
    const preview = URL.createObjectURL(file);
    const newPreviews = [...businessPhotosPrev, preview].slice(0, 2);
    setBusinessPhotosPrev(newPreviews);
    setUploadingBusiness(true);

    uploadBusinessPhoto(file, `temp/${community._id}/${crypto.randomUUID()}`)
      .then((url) => {
        setBusinessPhotoUrls((prev) => [...prev, url].slice(0, 2));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to upload photo');
      })
      .finally(() => setUploadingBusiness(false));
  }

  function validatePerson(): string {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'First and last name are required';
    if (!form.gender) return 'Gender is required';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) return 'Phone number must be exactly 10 digits';
    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) return 'Pincode must be 6 digits';
    if (form.aadharLast4 && !/^[0-9]{4}$/.test(form.aadharLast4)) return 'Aadhar must be last 4 digits';
    if (businessEnabled && !businessForm.name.trim()) return 'Business name is required';
    return '';
  }

  async function handlePhoneCheck() {
    const phone = form.phone.trim();
    if (!phone) {
      setError('Phone number is required for family head');
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Invalid phone number');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/check-phone?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        setError('Could not verify phone number right now. Please try again before continuing.');
        return;
      }
      const data = await res.json();
      if (data.exists && data.user) {
        const name = data.user.fullName || data.user.firstName || 'Unknown';
        const communities = data.user.communityIds?.map((c: { name: string }) => c.name).join(', ') || '';
        setError(`User "${name}" already exists with this phone number${communities ? ` (${communities})` : ''}`);
        return;
      }
      setPhase('head');
    } catch {
      setError('Failed to check phone number. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleHeadContinue() {
    const validationError = validatePerson();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setPhase('members');
  }

  function handleAddPendingMember() {
    if (!memberFirstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!memberGender) {
      setError('Gender is required');
      return;
    }
    if (!memberRelation) {
      setError('Relation is required');
      return;
    }
    if (!memberRelatedTo) {
      setError('Please select who this member is related to');
      return;
    }
    if (memberPhone && !/^[0-9]{10}$/.test(memberPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setError('');
    setPendingMembers((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        firstName: memberFirstName.trim(),
        lastName: memberLastName.trim(),
        phone: memberPhone.trim(),
        gender: memberGender,
        relation: memberRelation,
        relatedTo: memberRelatedTo,
      },
    ]);
    setMemberFirstName('');
    setMemberLastName('');
    setMemberPhone('');
    setMemberGender('');
    setMemberRelation('');
    setMemberRelatedTo('');
  }

  function removePendingMember(tempId: string) {
    setPendingMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  }

  async function handleSaveFamily() {
    setSubmitting(true);
    setError('');
    try {
      const headPayload = buildUserPayload(form, photoUrl, community._id);

      const batchMembers = pendingMembers.map((m) => {
        let relativeIndex: number | undefined;
        if (m.relation && m.relatedTo) {
          if (m.relatedTo === 'head') {
            relativeIndex = -1;
          } else {
            relativeIndex = pendingMembers.findIndex((pm) => pm.tempId === m.relatedTo);
          }
        }
        return {
          firstName: m.firstName,
          lastName: m.lastName || undefined,
          phone: m.phone || undefined,
          gender: m.gender || undefined,
          relation: m.relation || undefined,
          relativeIndex,
        };
      });

      const businessPayload = businessEnabled
        ? {
            name: businessForm.name.trim(),
            category: businessForm.category || undefined,
            phone: businessForm.phone || undefined,
            website: businessForm.website || undefined,
            description: businessForm.description || undefined,
            address: businessForm.address || undefined,
            instagramProfile: businessForm.instagramProfile || undefined,
            linkedinProfile: businessForm.linkedinProfile || undefined,
            googleMapsLink: businessForm.googleMapsLink || undefined,
            logo: businessLogoUrl || undefined,
            photos: businessPhotoUrls.length > 0 ? businessPhotoUrls : undefined,
          }
        : undefined;

      const res = await fetch('/api/admin/families/batch-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          head: headPayload,
          communityIds: [community._id],
          sampradaya: form.sampradaya || undefined,
          business: businessPayload,
          members: batchMembers.length > 0 ? batchMembers : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create family');
        return;
      }

      onMemberAdded();
      onOpenChange(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isUncontrolled && (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <UserPlus className="size-4" />
          Add Family
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {phase === 'phone' && 'Add Family — Verify Phone'}
            {phase === 'head' && 'Add Family — Head of Family'}
            {phase === 'members' && 'Add Family — Members'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {phase === 'phone' && (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-muted-foreground">
                Enter the phone number of the family head to check for existing records before proceeding.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone-check">
                  Phone number <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-muted-foreground" />
                  <Input
                    id="phone-check"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePhoneCheck();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === 'head' && (
            <PersonFieldsBlock
              form={form}
              setField={setField}
              photoPreview={photoPreview}
              onPhotoFileReady={handlePhotoFileReady}
              uploadingPhoto={uploadingPhoto}
              localities={community.localities ?? []}
              phoneReadOnly
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
            />
          )}

          {phase === 'members' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Head: {headName}</p>
                {pendingMembers.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {pendingMembers.map((m) => {
                      const relMeta = RELATIONS.find((r) => r.id === m.relation);
                      const relatedName = m.relatedTo === 'head'
                        ? headName
                        : (() => {
                            const p = pendingMembers.find((pm) => pm.tempId === m.relatedTo);
                            return p ? [p.firstName, p.lastName].filter(Boolean).join(' ') : '';
                          })();
                      return (
                        <div key={m.tempId} className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {[m.firstName, m.lastName].filter(Boolean).join(' ')}
                            {m.phone ? ` · ${m.phone}` : ''}
                            {relMeta && relatedName ? ` · ${relMeta.label} of ${relatedName}` : relMeta ? ` · ${relMeta.label}` : ''}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground"
                            onClick={() => removePendingMember(m.tempId)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator />

              <p className="text-sm font-medium">Add a member</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-firstName" className="text-xs">First name <span className="text-red-500">*</span></Label>
                  <Input
                    id="m-firstName"
                    placeholder="First name"
                    value={memberFirstName}
                    onChange={(e) => setMemberFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-lastName" className="text-xs">Last name</Label>
                  <Input
                    id="m-lastName"
                    placeholder="Last name"
                    value={memberLastName}
                    onChange={(e) => setMemberLastName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-phone" className="text-xs">Phone</Label>
                  <Input
                    id="m-phone"
                    placeholder="10-digit phone"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-gender" className="text-xs">Gender <span className="text-red-500">*</span></Label>
                  <Select value={memberGender} onValueChange={(v) => setMemberGender(v ?? '')}>
                    <SelectTrigger id="m-gender" className="w-full">
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-relation" className="text-xs">Relation <span className="text-red-500">*</span></Label>
                  <Select value={memberRelation} onValueChange={(v) => setMemberRelation(v ?? '')}>
                    <SelectTrigger id="m-relation" className="w-full">
                      {memberRelation
                        ? <span data-slot="select-value" className="flex flex-1 text-left">{RELATIONS.find((r) => r.id === memberRelation)?.label}</span>
                        : <SelectValue placeholder="Select relation" />
                      }
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-relatedTo" className="text-xs">Related to <span className="text-red-500">*</span></Label>
                  <Select value={memberRelatedTo} onValueChange={(v) => setMemberRelatedTo(v ?? '')}>
                    <SelectTrigger id="m-relatedTo" className="w-full">
                      {memberRelatedTo
                        ? <span data-slot="select-value" className="flex flex-1 text-left">{
                            memberRelatedTo === 'head'
                              ? `${headName} (Head)`
                              : (() => { const pm = pendingMembers.find((p) => p.tempId === memberRelatedTo); return pm ? [pm.firstName, pm.lastName].filter(Boolean).join(' ') : ''; })()
                          }</span>
                        : <SelectValue placeholder="Select person" />
                      }
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">{headName} (Head)</SelectItem>
                      {pendingMembers.map((pm) => (
                        <SelectItem key={pm.tempId} value={pm.tempId}>
                          {[pm.firstName, pm.lastName].filter(Boolean).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={handleAddPendingMember}
              >
                <UserPlus className="size-3.5" />
                Add Member
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          {phase === 'phone' && (
            <Button size="lg" onClick={handlePhoneCheck} disabled={submitting}>
              {submitting ? 'Checking...' : 'Continue'}
            </Button>
          )}
          {phase === 'head' && (
            <Button size="lg" onClick={handleHeadContinue}>
              Continue
            </Button>
          )}
          {phase === 'members' && (
            <>
              <Button variant="outline" size="lg" onClick={() => setPhase('head')}>
                Back
              </Button>
              <Button size="lg" onClick={handleSaveFamily} disabled={submitting}>
                {submitting ? 'Saving...' : `Save Family${pendingMembers.length > 0 ? ` (${pendingMembers.length + 1} members)` : ''}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
