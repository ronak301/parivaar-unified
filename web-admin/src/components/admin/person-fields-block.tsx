'use client';

import { useState } from 'react';
import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ClickableAvatar, ClickableImage } from '@/components/ui/clickable-image';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Plus, UserRound } from 'lucide-react';
import { states, getCitiesForState, getDistrictsForState } from '@/lib/locations';

export interface PersonForm {
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

export interface BusinessForm {
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

export function emptyPersonForm(): PersonForm {
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
    state: '',
    city: '',
    district: '',
    locality: '',
    pincode: '',
  };
}

export function emptyBusinessForm(): BusinessForm {
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

export function buildUserPayload(form: PersonForm, profilePicture: string | undefined, communityId?: string) {
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
    communityIds: communityId ? [communityId] : undefined,
  };
}

export function buildBusinessPayload(form: BusinessForm, logo: string | undefined, photos: string[]) {
  return {
    name: form.name.trim(),
    category: form.category || undefined,
    phone: form.phone || undefined,
    website: form.website || undefined,
    description: form.description || undefined,
    address: form.address || undefined,
    instagramProfile: form.instagramProfile || undefined,
    linkedinProfile: form.linkedinProfile || undefined,
    googleMapsLink: form.googleMapsLink || undefined,
    logo: logo || undefined,
    photos: photos.length > 0 ? photos : undefined,
  };
}

export function PersonFieldsBlock({
  form,
  setField,
  photoPreview,
  onPhotoFileReady,
  uploadingPhoto,
  localities = [],
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
  showSampradaya = true,
}: {
  form: PersonForm;
  setField: <K extends keyof PersonForm>(key: K, value: PersonForm[K]) => void;
  photoPreview: string;
  onPhotoFileReady: (file: File) => void;
  uploadingPhoto?: boolean;
  localities?: string[];
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
  showSampradaya?: boolean;
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
          <Label htmlFor="pf-lastName">Last name</Label>
          <Input id="pf-lastName" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
        </div>
        {showSampradaya && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-sampradaya">Sampradaya</Label>
            <Select value={form.sampradaya} onValueChange={(v) => setField('sampradaya', v ?? '')}>
              <SelectTrigger id="pf-sampradaya" className="w-full">
                {form.sampradaya
                  ? <span data-slot="select-value" className="flex flex-1 text-left">{form.sampradaya}</span>
                  : <SelectValue placeholder="Select sampradaya" />
                }
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sthanak">Sthanak</SelectItem>
                <SelectItem value="Mandrimargi">Mandrimargi</SelectItem>
                <SelectItem value="Terapanthi">Terapanthi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-phone">Phone</Label>
          <Input
            id="pf-phone"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            disabled={phoneReadOnly}
            onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
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
          <Label htmlFor="pf-guardianName">Father&apos;s Name / Guardian Name</Label>
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
              {form.gender
                ? <span data-slot="select-value" className="flex flex-1 text-left">{Gender.find((g) => g.id === form.gender)?.label ?? form.gender}</span>
                : <SelectValue placeholder="Select gender" />
              }
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
          <Label htmlFor="pf-specialEducation">Special education</Label>
          <Input
            id="pf-specialEducation"
            value={form.specialEducation}
            onChange={(e) => setField('specialEducation', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-bloodGroup">Blood group</Label>
          <Select value={form.bloodGroup} onValueChange={(v) => setField('bloodGroup', v ?? '')}>
            <SelectTrigger id="pf-bloodGroup" className="w-full">
              {form.bloodGroup
                ? <span data-slot="select-value" className="flex flex-1 text-left">{form.bloodGroup}</span>
                : <SelectValue placeholder="Select blood group" />
              }
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
            placeholder="Gotra"
            value={form.nanihaal}
            onChange={(e) => setField('nanihaal', e.target.value)}
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
            <Select value={form.state} onValueChange={(v) => { setField('state', v ?? ''); setField('city', ''); setField('district', ''); }}>
              <SelectTrigger id="pf-state" className="w-full">
                {form.state
                  ? <span data-slot="select-value" className="flex flex-1 text-left">{form.state}</span>
                  : <SelectValue placeholder="Select state" />
                }
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
                {form.city
                  ? <span data-slot="select-value" className="flex flex-1 text-left">{form.city}</span>
                  : <SelectValue placeholder={form.state ? 'Select city' : 'Select state first'} />
                }
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
                {form.district
                  ? <span data-slot="select-value" className="flex flex-1 text-left">{form.district}</span>
                  : (
                    <SelectValue
                      placeholder={
                        !form.state
                          ? 'Select state first'
                          : getDistrictsForState(form.state).length === 0
                            ? 'Not available for this state'
                            : 'Select district'
                      }
                    />
                  )
                }
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
                  {form.locality
                    ? <span data-slot="select-value" className="flex flex-1 text-left">{form.locality}</span>
                    : <SelectValue placeholder="Select locality" />
                  }
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
                    {businessForm.category
                      ? <span data-slot="select-value" className="flex flex-1 text-left">{BusinessTypes.find((bt) => bt.id === businessForm.category)?.label ?? businessForm.category}</span>
                      : <SelectValue placeholder="Select category" />
                    }
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
