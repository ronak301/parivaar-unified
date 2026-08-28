'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender } from '@parivaar/shared';
import type { Community } from '@parivaar/shared';
import { Plus, X, UserPlus, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { uploadUserPhoto, uploadBusinessLogo, uploadBusinessPhoto } from '@/lib/firebase/storage';
import { readCache, writeCache } from '@/lib/cache/local-cache';
import {
  PersonFieldsBlock,
  emptyPersonForm,
  emptyBusinessForm,
  buildUserPayload,
  buildBusinessPayload,
  type PersonForm,
  type BusinessForm,
} from '@/components/admin/person-fields-block';

const RELATIONS = [
  { id: 'son', label: 'Son' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'spouse', label: 'Spouse' },
  { id: 'sibling', label: 'Brother/Sister' },
];

interface PendingMember {
  tempId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  relation: string;
  relatedTo: string;
}

export default function CommunityFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [communityId, setCommunityId] = useState('');
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [phase, setPhase] = useState<'phone' | 'head' | 'members' | 'success'>('phone');
  const [checkingPhone, setCheckingPhone] = useState(false);

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

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [memberFirstName, setMemberFirstName] = useState('');
  const [memberLastName, setMemberLastName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberGender, setMemberGender] = useState('');
  const [memberRelation, setMemberRelation] = useState('');
  const [memberRelatedTo, setMemberRelatedTo] = useState('');

  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alertError, setAlertError] = useState('');

  const headName = [form.firstName, form.lastName].filter(Boolean).join(' ');

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const { id } = await params;
        setCommunityId(id);
        const cacheKey = `community_detail_${id}`;
        const cached = readCache<Community>(cacheKey);
        if (cached) {
          setCommunity(cached);
          setLoading(false);
        }

        const res = await fetch(`/api/admin/communities/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCommunity(data.community);
          writeCache(cacheKey, data.community);
        } else if (res.status === 404) {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to fetch community:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, [params]);

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

    uploadUserPhoto(file, `public-submit/${communityId}/${crypto.randomUUID()}`)
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

    uploadBusinessLogo(file, `public-submit/${communityId}/${crypto.randomUUID()}`)
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

    uploadBusinessPhoto(file, `public-submit/${communityId}/${crypto.randomUUID()}`)
      .then((url) => setBusinessPhotoUrls((prev) => [...prev, url].slice(0, 2)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to upload photo'))
      .finally(() => setUploadingBusiness(false));
  }

  function validatePerson(): string {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.gender) return 'Gender is required';
    if (!form.phone || !/^[0-9]{10}$/.test(form.phone)) return 'A valid 10-digit phone number is required';
    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) return 'Pincode must be 6 digits';
    if (form.aadharLast4 && !/^[0-9]{4}$/.test(form.aadharLast4)) return 'Aadhar must be last 4 digits';
    if (businessEnabled && !businessForm.name.trim()) return 'Business name is required';
    return '';
  }

  async function handlePhoneCheck() {
    const phone = form.phone.trim();
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Invalid phone number');
      return;
    }

    setCheckingPhone(true);
    setError('');
    try {
      const res = await fetch(`/api/public/check-phone?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        setError('Could not verify phone number right now. Please try again.');
        return;
      }
      const data = await res.json();
      if (data.exists) {
        setError('This phone number is already registered with us.');
        return;
      }
      setPhase('head');
    } catch {
      setError('Failed to check phone number. Please try again.');
    } finally {
      setCheckingPhone(false);
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

  async function handleAddPendingMember() {
    if (!memberFirstName.trim()) {
      setAlertError('First name is required');
      return;
    }
    if (!memberGender) {
      setAlertError('Gender is required');
      return;
    }
    if (!memberRelation) {
      setAlertError('Relation is required');
      return;
    }
    if (!memberRelatedTo) {
      setAlertError('Please select who this member is related to');
      return;
    }
    if (memberRelation === 'sibling' && memberRelatedTo !== 'head') {
      setAlertError('Siblings can only be added to the family head');
      return;
    }
    if (memberPhone && !/^[0-9]{10}$/.test(memberPhone)) {
      setAlertError('Phone number must be exactly 10 digits');
      return;
    }
    if (memberPhone) {
      if (memberPhone === form.phone) {
        setAlertError('This phone number already exists (family head)');
        return;
      }
      if (pendingMembers.some((m) => m.phone === memberPhone)) {
        setAlertError('This phone number already exists in added members');
        return;
      }

      try {
        const res = await fetch(`/api/public/check-phone?phone=${encodeURIComponent(memberPhone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setAlertError('This phone number is already registered with us.');
            return;
          }
        }
      } catch {
        setAlertError('Could not verify phone number. Please try again.');
        return;
      }
    }

    setAlertError('');
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

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const headPayload = buildUserPayload(form, photoUrl);

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
        ? buildBusinessPayload(businessForm, businessLogoUrl, businessPhotoUrls)
        : undefined;

      const res = await fetch('/api/public/families/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          head: headPayload,
          sampradaya: form.sampradaya || undefined,
          business: businessPayload,
          members: batchMembers.length > 0 ? batchMembers : undefined,
          submitterName: submitterName.trim() || undefined,
          submitterPhone: submitterPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit. Please try again.');
        return;
      }

      setPhase('success');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmitAnother() {
    setForm(emptyPersonForm());
    setPhotoPreview('');
    setUploadingPhoto(false);
    setPhotoUrl(undefined);
    setBusinessEnabled(false);
    setBusinessForm(emptyBusinessForm());
    setUploadingBusiness(false);
    setBusinessLogoPrev('');
    setBusinessLogoUrl(undefined);
    setBusinessPhotosPrev([]);
    setBusinessPhotoUrls([]);
    setPendingMembers([]);
    setMemberFirstName('');
    setMemberLastName('');
    setMemberPhone('');
    setMemberGender('');
    setMemberRelation('');
    setMemberRelatedTo('');
    setSubmitterName('');
    setSubmitterPhone('');
    setError('');
    setAlertError('');
    setPhase('phone');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (notFound || !community) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Community not found. Please check the link and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-black via-slate-900 to-black text-white rounded-t-2xl px-8 py-16 sm:px-10 sm:py-20 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{community.name}</h1>
              <p className="text-base sm:text-lg text-gray-300 font-medium">Registration Form</p>
            </div>
          </div>

          <div className="rounded-b-2xl border border-t-0 bg-white p-6 sm:p-8 space-y-8">
            {phase === 'success' && (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <CheckCircle2 className="size-16 text-green-600" />
                <h2 className="text-xl font-semibold text-foreground">Submission received</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Thank you{headName ? `, ${headName}` : ''}. Your family details have been sent to the community
                  admins for approval. You&apos;ll be added to the directory once it&apos;s reviewed.
                </p>
                <Button size="lg" onClick={handleSubmitAnother}>
                  Add Another Family
                </Button>
              </div>
            )}

            {phase === 'phone' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Verify Phone Number</h2>
                <p className="text-sm text-muted-foreground">
                  Enter Family Head phone number to check for existing records before proceeding.
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone-check">
                    Phone number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone-check"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    className="h-12 text-lg"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePhoneCheck();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {phase === 'head' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Family Head Information</h2>
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
              </div>
            )}

            {phase === 'members' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Family Members</h2>
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
                              <X className="size-3" />
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-5 border rounded-lg p-6 bg-gray-50">
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
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit phone"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="m-gender" className="text-xs">Gender <span className="text-red-500">*</span></Label>
                      <Select value={memberGender} onValueChange={(v) => setMemberGender(v ?? '')}>
                        <SelectTrigger id="m-gender" className="w-full">
                          {memberGender
                            ? <span data-slot="select-value" className="flex flex-1 text-left">{Gender.find((g) => g.id === memberGender)?.label ?? memberGender}</span>
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
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleAddPendingMember}>
                    <UserPlus className="size-3.5" />
                    Add Member
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Your details (optional)</p>
                  <p className="text-xs text-muted-foreground">
                    Let us know who&apos;s submitting this, in case the admin has questions.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="submitter-name" className="text-xs">Your name</Label>
                      <Input
                        id="submitter-name"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="submitter-phone" className="text-xs">Your phone</Label>
                      <Input
                        id="submitter-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit phone"
                        value={submitterPhone}
                        onChange={(e) => setSubmitterPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {phase !== 'success' && (
              <div className="flex gap-3 border-t pt-6">
                {phase === 'members' && (
                  <Button variant="outline" size="lg" onClick={() => setPhase('head')} className="flex-1">
                    Back
                  </Button>
                )}
                {phase === 'phone' && (
                  <Button size="lg" onClick={handlePhoneCheck} disabled={checkingPhone} className="w-full">
                    {checkingPhone ? 'Checking...' : 'Continue'}
                  </Button>
                )}
                {phase === 'head' && (
                  <Button size="lg" onClick={handleHeadContinue} className="w-full">
                    <Plus />
                    Continue
                  </Button>
                )}
                {phase === 'members' && (
                  <Button size="lg" onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? 'Submitting...' : `Submit for Approval${pendingMembers.length > 0 ? ` (${pendingMembers.length + 1} members)` : ''}`}
                  </Button>
                )}
              </div>
            )}

            <AlertDialog open={!!alertError} onOpenChange={(open) => { if (!open) setAlertError(''); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Error</AlertDialogTitle>
                  <AlertDialogDescription>{alertError}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={() => setAlertError('')}>OK</AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
