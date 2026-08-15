'use client';

import { useRef, useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { uploadUserPhoto } from '@/lib/firebase/storage';
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

const RELATIONS = [
  { id: 'father', label: 'Father' },
  { id: 'mother', label: 'Mother' },
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
  onPhotoSelect,
  localities,
  phoneReadOnly,
  businessEnabled,
  onToggleBusiness,
  businessForm,
  setBusinessField,
  businessLogoPrev,
  businessPhotosPrev,
  onBusinessLogoSelect,
  onBusinessPhotosSelect,
}: {
  form: PersonForm;
  setField: <K extends keyof PersonForm>(key: K, value: PersonForm[K]) => void;
  photoPreview: string;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localities: string[];
  phoneReadOnly?: boolean;
  businessEnabled: boolean;
  onToggleBusiness: () => void;
  businessForm: BusinessForm;
  setBusinessField: <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) => void;
  businessLogoPrev: string;
  businessPhotosPrev: string[];
  onBusinessLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBusinessPhotosSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Manually handle the file like the input onChange does
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      onPhotoSelect({
        target: {
          files: e.dataTransfer.files,
          value: '',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Avatar className="size-56">
          <AvatarImage src={photoPreview} alt="" />
          <AvatarFallback>
            <UserRound className="size-24" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-2 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onPhotoSelect}
          />
          <Button type="button" variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
            <Upload />
            {photoPreview ? 'Change photo' : 'Upload photo'}
          </Button>
          <p className="text-xs text-muted-foreground">or drag and drop your photo here</p>
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP · Max 3MB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-sampradaya">Sampradaya</Label>
          <Select value={form.sampradaya || undefined} onValueChange={(v) => setField('sampradaya', String(v))}>
            <SelectTrigger id="pf-sampradaya" className="w-full">
              <SelectValue placeholder="Select sampradaya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Terapanthi">Terapanthi</SelectItem>
              <SelectItem value="Sthanakvasi">Sthanakvasi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-firstName">First name</Label>
          <Input id="pf-firstName" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-lastName">Last name</Label>
          <Input id="pf-lastName" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
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
          <Label htmlFor="pf-gender">Gender</Label>
          <Select value={form.gender || undefined} onValueChange={(v) => setField('gender', String(v))}>
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
          <Select value={form.bloodGroup || undefined} onValueChange={(v) => setField('bloodGroup', String(v))}>
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
          <Label htmlFor="pf-nanihaal">Nanihaal</Label>
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
            <Select value={form.state || undefined} onValueChange={(v) => setField('state', String(v))}>
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
              value={form.city || undefined}
              onValueChange={(v) => setField('city', String(v))}
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
              value={form.district || undefined}
              onValueChange={(v) => setField('district', String(v))}
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
              <Select value={form.locality || undefined} onValueChange={(v) => setField('locality', String(v))}>
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
                <Label htmlFor="pf-biz-name">Business name</Label>
                <Input
                  id="pf-biz-name"
                  value={businessForm.name}
                  onChange={(e) => setBusinessField('name', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pf-biz-category">Category</Label>
                <Select
                  value={businessForm.category || undefined}
                  onValueChange={(v) => setBusinessField('category', String(v))}
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
                    <img src={businessLogoPrev} alt="Logo" className="size-10 rounded object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground file:cursor-pointer"
                    onChange={onBusinessLogoSelect}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Photos (max 2)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {businessPhotosPrev.map((url, idx) => (
                    <img key={idx} src={url} alt={`Photo ${idx + 1}`} className="size-12 rounded object-cover" />
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground file:cursor-pointer"
                  onChange={onBusinessPhotosSelect}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AddFamilyDialog({
  community,
  onMemberAdded,
}: {
  community: Community;
  onMemberAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'phone' | 'head' | 'members'>('phone');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [addingMember, setAddingMember] = useState(false);

  const [form, setForm] = useState<PersonForm>(emptyPersonForm());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [businessEnabled, setBusinessEnabled] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>(emptyBusinessForm());
  const [relation, setRelation] = useState('');
  const [relatedTo, setRelatedTo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [headAddress, setHeadAddress] = useState<Partial<PersonForm> | null>(null);
  const [businessFiles, setBusinessFiles] = useState<BusinessFiles>({ logo: null, photos: [] });
  const [businessLogoPrev, setBusinessLogoPrev] = useState('');
  const [businessPhotosPrev, setBusinessPhotosPrev] = useState<string[]>([]);

  function setField<K extends keyof PersonForm>(key: K, value: PersonForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBusinessField<K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) {
    setBusinessForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetPersonForm() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (businessLogoPrev) URL.revokeObjectURL(businessLogoPrev);
    businessPhotosPrev.forEach((url) => URL.revokeObjectURL(url));
    setForm(emptyPersonForm());
    setPhotoFile(null);
    setPhotoPreview('');
    setBusinessEnabled(false);
    setBusinessForm(emptyBusinessForm());
    setBusinessFiles({ logo: null, photos: [] });
    setBusinessLogoPrev('');
    setBusinessPhotosPrev([]);
  }

  function reset() {
    resetPersonForm();
    setPhase('phone');
    setFamilyId(null);
    setMembers([]);
    setAddingMember(false);
    setRelation('');
    setRelatedTo('');
    setError('');
    setHeadAddress(null);
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleBusinessLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (businessLogoPrev) URL.revokeObjectURL(businessLogoPrev);
    setBusinessFiles((prev) => ({ ...prev, logo: file }));
    setBusinessLogoPrev(URL.createObjectURL(file));
  }

  function handleBusinessPhotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 2);
    e.target.value = '';
    if (!files.length) return;

    setError('');
    businessPhotosPrev.forEach((url) => URL.revokeObjectURL(url));
    setBusinessFiles((prev) => ({ ...prev, photos: files }));
    setBusinessPhotosPrev(files.map((f) => URL.createObjectURL(f)));
  }

  function validatePerson(): string {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'First and last name are required';
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
      const checkRes = await fetch(`/api/admin/users/check-phone?phone=${encodeURIComponent(phone)}`);
      const checkData = await checkRes.json();
      if (checkRes.ok && checkData.exists) {
        const name = checkData.user?.fullName ?? checkData.user?.firstName ?? '';
        const communities = (checkData.user?.communityIds as { _id: string; name: string }[] | undefined)
          ?.map((c) => c.name)
          .join(', ');
        let msg = 'A member with this phone number already exists';
        if (name) msg += ` — ${name}`;
        if (communities) msg += ` (${communities})`;
        setError(msg);
        return;
      }
      setPhase('head');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function createPerson(): Promise<{ _id: string; firstName: string; lastName?: string } | null> {
    let profilePicture: string | undefined;
    if (photoFile) {
      try {
        profilePicture = await uploadUserPhoto(photoFile, crypto.randomUUID());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload photo');
        return null;
      }
    }

    const userRes = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildUserPayload(form, profilePicture, community._id)),
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      setError(userData.error ?? 'Failed to create member');
      return null;
    }

    if (businessEnabled) {
      let logoUrl: string | undefined;
      let photoUrls: string[] = [];

      if (businessFiles.logo) {
        try {
          logoUrl = await uploadUserPhoto(businessFiles.logo, `biz-logo-${crypto.randomUUID()}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to upload logo');
          return null;
        }
      }

      if (businessFiles.photos.length > 0) {
        try {
          photoUrls = await Promise.all(
            businessFiles.photos.map((file) => uploadUserPhoto(file, `biz-photo-${crypto.randomUUID()}`))
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to upload photos');
          return null;
        }
      }

      const bizRes = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessForm.name.trim(),
          category: businessForm.category || undefined,
          phone: businessForm.phone || undefined,
          website: businessForm.website || undefined,
          description: businessForm.description || undefined,
          address: businessForm.address || undefined,
          instagramProfile: businessForm.instagramProfile || undefined,
          linkedinProfile: businessForm.linkedinProfile || undefined,
          googleMapsLink: businessForm.googleMapsLink || undefined,
          logo: logoUrl || undefined,
          photos: photoUrls.length > 0 ? photoUrls : undefined,
          ownerId: userData.user._id,
          communityId: community._id,
        }),
      });
      const bizData = await bizRes.json();
      if (!bizRes.ok) {
        setError(bizData.error ?? 'Failed to create business');
        return null;
      }
    }

    return userData.user;
  }

  async function handleAddHead() {
    const validationError = validatePerson();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const newUser = await createPerson();
      if (!newUser) return;

      const familyRes = await fetch('/api/admin/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headId: newUser._id,
          communityIds: [community._id],
          sampradaya: form.sampradaya || undefined,
        }),
      });
      const familyData = await familyRes.json();
      if (!familyRes.ok) {
        setError(familyData.error ?? 'Failed to create family');
        return;
      }

      setFamilyId(familyData.family._id);
      setMembers([{ _id: newUser._id, name: fullName(newUser), relationLabel: 'Head' }]);
      setHeadAddress({
        fullAddress: form.fullAddress,
        state: form.state,
        city: form.city,
        district: form.district,
        locality: form.locality,
        pincode: form.pincode,
        nativePlace: form.nativePlace,
        nativeDistrict: form.nativeDistrict,
        sampradaya: form.sampradaya,
      });
      resetPersonForm();
      setPhase('members');
      onMemberAdded();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddMember() {
    const validationError = validatePerson();
    if (validationError) {
      setError(validationError);
      return;
    }
    if ((relation && !relatedTo) || (!relation && relatedTo)) {
      setError('Select both a relation and a related member, or leave both blank');
      return;
    }
    if (!familyId) return;

    setSubmitting(true);
    setError('');
    try {
      const newUser = await createPerson();
      if (!newUser) return;

      const addRes = await fetch(`/api/admin/families/${familyId}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser._id,
          relation: relation || undefined,
          relativeId: relatedTo || undefined,
        }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error ?? 'Failed to add family member');
        return;
      }

      const relatedMember = members.find((m) => m._id === relatedTo);
      const relationMeta = RELATIONS.find((r) => r.id === relation);
      setMembers((prev) => [
        ...prev,
        {
          _id: newUser._id,
          name: fullName(newUser),
          relationLabel:
            relationMeta && relatedMember ? `${relationMeta.label} of ${relatedMember.name}` : undefined,
        },
      ]);
      resetPersonForm();
      setRelation('');
      setRelatedTo('');
      setAddingMember(false);
      onMemberAdded();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button size="lg" />}>
        <UserPlus />
        Add Family
      </DialogTrigger>
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
                <Label htmlFor="phone-check">Phone number</Label>
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

          {phase === 'members' && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Family members</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <Badge key={m._id} variant="secondary">
                    {m.name}
                    {m.relationLabel ? ` · ${m.relationLabel}` : ''}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {phase === 'head' && (
            <PersonFieldsBlock
              form={form}
              setField={setField}
              photoPreview={photoPreview}
              onPhotoSelect={handlePhotoSelect}
              localities={community.localities ?? []}
              phoneReadOnly
              businessEnabled={businessEnabled}
              onToggleBusiness={() => setBusinessEnabled((v) => !v)}
              businessForm={businessForm}
              setBusinessField={setBusinessField}
              businessLogoPrev={businessLogoPrev}
              businessPhotosPrev={businessPhotosPrev}
              onBusinessLogoSelect={handleBusinessLogoSelect}
              onBusinessPhotosSelect={handleBusinessPhotosSelect}
            />
          )}

          {phase === 'members' && addingMember && (
            <div className="flex flex-col gap-5">
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pf-relation">Relation</Label>
                  <Select value={relation || undefined} onValueChange={(v) => setRelation(String(v))}>
                    <SelectTrigger id="pf-relation" className="w-full">
                      <SelectValue placeholder="Optional" />
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pf-relatedTo">Related to</Label>
                  <Select value={relatedTo || undefined} onValueChange={(v) => setRelatedTo(String(v))}>
                    <SelectTrigger id="pf-relatedTo" className="w-full">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <PersonFieldsBlock
                form={form}
                setField={setField}
                photoPreview={photoPreview}
                onPhotoSelect={handlePhotoSelect}
                localities={community.localities ?? []}
                businessEnabled={businessEnabled}
                onToggleBusiness={() => setBusinessEnabled((v) => !v)}
                businessForm={businessForm}
                setBusinessField={setBusinessField}
                businessLogoPrev={businessLogoPrev}
                businessPhotosPrev={businessPhotosPrev}
                onBusinessLogoSelect={handleBusinessLogoSelect}
                onBusinessPhotosSelect={handleBusinessPhotosSelect}
              />
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
            <Button size="lg" onClick={handleAddHead} disabled={submitting}>
              {submitting ? 'Adding...' : 'Continue'}
            </Button>
          )}
          {phase === 'members' && !addingMember && (
            <>
              <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
                Done
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  if (headAddress) {
                    setField('fullAddress', headAddress.fullAddress || '');
                    setField('state', headAddress.state || 'Karnataka');
                    setField('city', headAddress.city || 'Bengaluru');
                    setField('district', headAddress.district || '');
                    setField('locality', headAddress.locality || '');
                    setField('pincode', headAddress.pincode || '');
                    setField('nativePlace', headAddress.nativePlace || '');
                    setField('nativeDistrict', headAddress.nativeDistrict || '');
                    setField('sampradaya', headAddress.sampradaya || '');
                  }
                  setAddingMember(true);
                }}
              >
                <Plus />
                Add Family Member
              </Button>
            </>
          )}
          {phase === 'members' && addingMember && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  resetPersonForm();
                  setRelation('');
                  setRelatedTo('');
                  setAddingMember(false);
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button size="lg" onClick={handleAddMember} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Member & Continue'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
