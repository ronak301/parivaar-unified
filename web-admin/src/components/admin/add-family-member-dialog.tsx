'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserPlus } from 'lucide-react';
import { Gender } from '@parivaar/shared';
import type { UserData, FamilyTreeMember } from './member-detail-types';

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

export function AddFamilyMemberDialog({ open, onOpenChange, member, familyMembers, onAdded }: AddFamilyMemberDialogProps) {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [relation, setRelation] = useState('');
  const [relatedTo, setRelatedTo] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [alertError, setAlertError] = useState('');

  const memberName = member.fullName || `${member.firstName} ${member.lastName ?? ''}`.trim();

  const existingOptions = [
    { id: `existing:${member._id}`, label: `${memberName} (this member)` },
    ...familyMembers
      .filter((m) => m._id !== member._id)
      .map((m) => ({ id: `existing:${m._id}`, label: m.fullName || `${m.firstName} ${m.lastName ?? ''}`.trim() })),
  ];

  const relatedToOptions = [
    ...existingOptions,
    ...pendingMembers.map((m) => ({ id: `pending:${m.tempId}`, label: `${[m.firstName, m.lastName].filter(Boolean).join(' ')} (new)` })),
  ];

  function relatedToLabel(key: string): string {
    return relatedToOptions.find((o) => o.id === key)?.label.replace(' (new)', '').replace(' (this member)', '') ?? '';
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPendingMembers([]);
      setFirstName('');
      setLastName('');
      setPhone('');
      setGender('');
      setRelation('');
      setRelatedTo('');
      setError('');
      setAlertError('');
    }
    onOpenChange(next);
  }

  async function handleAddPendingMember() {
    if (!firstName.trim()) {
      setAlertError('First name is required');
      return;
    }
    if (!gender) {
      setAlertError('Gender is required');
      return;
    }
    if (!relation) {
      setAlertError('Relation is required');
      return;
    }
    if (!relatedTo) {
      setAlertError('Please select who this member is related to');
      return;
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setAlertError('Phone number must be exactly 10 digits');
      return;
    }

    if (phone) {
      if (phone === member.phone) {
        setAlertError('This phone number already exists (family head)');
        return;
      }
      if (pendingMembers.some((m) => m.phone === phone)) {
        setAlertError('This phone number already exists in added members');
        return;
      }

      try {
        const res = await fetch(`/api/admin/users/check-phone?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            const name = data.user?.fullName || data.user?.firstName || 'Unknown';
            const communities = data.user?.communityIds?.map((c: { name: string }) => c.name).join(', ') || '';
            setAlertError(`Phone number is already registered to "${name}"${communities ? ` (${communities})` : ''}`);
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
      { tempId: crypto.randomUUID(), firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), gender, relation, relatedTo },
    ]);
    setFirstName('');
    setLastName('');
    setPhone('');
    setGender('');
    setRelation('');
    setRelatedTo('');
  }

  function removePendingMember(tempId: string) {
    setPendingMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  }

  async function handleSubmit() {
    if (pendingMembers.length === 0) {
      setError('Add at least one member before saving');
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

      const payload = {
        members: pendingMembers.map((m) => {
          const [kind, value] = m.relatedTo.split(':');
          const pendingIndex = kind === 'pending' ? pendingMembers.findIndex((pm) => pm.tempId === value) : -1;
          return {
            firstName: m.firstName,
            lastName: m.lastName || undefined,
            phone: m.phone || undefined,
            gender: m.gender || undefined,
            relation: m.relation,
            ...(kind === 'existing' ? { relativeId: value } : { relativeIndex: pendingIndex }),
          };
        }),
      };

      const addRes = await fetch(`/api/admin/families/${familyId}/add-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || 'Failed to add family members');
        return;
      }

      handleOpenChange(false);
      onAdded();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {pendingMembers.length > 0 && (
            <>
              <div className="flex flex-col gap-1">
                {pendingMembers.map((m) => {
                  const relMeta = RELATIONS.find((r) => r.id === m.relation);
                  const genderLabel = Gender.find((g) => g.id === m.gender)?.label;
                  return (
                    <div key={m.tempId} className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {[m.firstName, m.lastName].filter(Boolean).join(' ')}
                        {m.phone ? ` · ${m.phone}` : ''}
                        {genderLabel ? ` · ${genderLabel}` : ''}
                        {relMeta ? ` · ${relMeta.label} of ${relatedToLabel(m.relatedTo)}` : ''}
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
              <Separator />
            </>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Add a member</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-firstName" className="text-xs">First name <span className="text-red-500">*</span></Label>
                <Input id="m-firstName" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-lastName" className="text-xs">Last name</Label>
                <Input id="m-lastName" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-gender" className="text-xs">Gender <span className="text-red-500">*</span></Label>
                <Select value={gender} onValueChange={(v) => setGender(v ?? '')}>
                  <SelectTrigger id="m-gender" className="w-full">
                    {gender
                      ? <span data-slot="select-value" className="flex flex-1 text-left">{Gender.find((g) => g.id === gender)?.label}</span>
                      : <SelectValue placeholder="Select gender" />
                    }
                  </SelectTrigger>
                  <SelectContent>
                    {Gender.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-relation" className="text-xs">Relation <span className="text-red-500">*</span></Label>
                <Select value={relation} onValueChange={(v) => setRelation(v ?? '')}>
                  <SelectTrigger id="m-relation" className="w-full">
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
                <Label htmlFor="m-relatedTo" className="text-xs">Related to <span className="text-red-500">*</span></Label>
                <Select value={relatedTo} onValueChange={(v) => setRelatedTo(v ?? '')}>
                  <SelectTrigger id="m-relatedTo" className="w-full">
                    {relatedTo
                      ? <span data-slot="select-value" className="flex flex-1 text-left">{relatedToOptions.find((o) => o.id === relatedTo)?.label}</span>
                      : <SelectValue placeholder="Select person" />
                    }
                  </SelectTrigger>
                  <SelectContent>
                    {relatedToOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label htmlFor="m-phone" className="text-xs">Phone (optional)</Label>
                <Input id="m-phone" placeholder="10-digit phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {relation && relatedTo && firstName.trim() && (
              <p className="text-xs text-muted-foreground">
                ({firstName.trim()} is {RELATIONS.find((r) => r.id === relation)?.label.toLowerCase()} of {relatedToLabel(relatedTo)})
              </p>
            )}

            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleAddPendingMember}>
              <UserPlus className="size-3.5" />
              Add Member
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <AlertDialog open={!!alertError} onOpenChange={(open) => { if (!open) setAlertError(''); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{alertError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setAlertError('')}>OK</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>

        <DialogFooter>
          <Button size="lg" onClick={handleSubmit} disabled={saving || pendingMembers.length === 0}>
            {saving ? 'Saving...' : `Save${pendingMembers.length > 0 ? ` (${pendingMembers.length} member${pendingMembers.length > 1 ? 's' : ''})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
