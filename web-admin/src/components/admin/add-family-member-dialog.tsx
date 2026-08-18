'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, X } from 'lucide-react';
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
];

interface MemberRow {
  firstName: string;
  lastName: string;
  phone: string;
  relation: string;
  relativeKey: string;
}

function emptyRow(): MemberRow {
  return { firstName: '', lastName: '', phone: '', relation: '', relativeKey: '' };
}

export function AddFamilyMemberDialog({ open, onOpenChange, member, familyMembers, onAdded }: AddFamilyMemberDialogProps) {
  const [rows, setRows] = useState<MemberRow[]>([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const existingOptions = [
    { key: `existing:${member._id}`, label: member.fullName || `${member.firstName} ${member.lastName ?? ''}`.trim() },
    ...familyMembers
      .filter((m) => m._id !== member._id)
      .map((m) => ({ key: `existing:${m._id}`, label: m.fullName || `${m.firstName} ${m.lastName ?? ''}`.trim() })),
  ];

  function relativeOptionsFor(rowIndex: number) {
    const priorRowOptions = rows
      .slice(0, rowIndex)
      .map((r, i) => ({ key: `row:${i}`, label: r.firstName.trim() ? `${r.firstName.trim()} (new)` : '' }))
      .filter((o) => o.label);
    return [...existingOptions, ...priorRowOptions];
  }

  function relativeLabel(rowIndex: number, relativeKey: string): string {
    return relativeOptionsFor(rowIndex).find((o) => o.key === relativeKey)?.label.replace(' (new)', '') ?? '';
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setRows([emptyRow()]);
      setError('');
    }
    onOpenChange(next);
  }

  function updateRow(index: number, patch: Partial<MemberRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.firstName.trim()) {
        setError(`Row ${i + 1}: enter a first name`);
        return;
      }
      if (!r.relation) {
        setError(`Row ${i + 1}: select a relation`);
        return;
      }
      if (!r.relativeKey) {
        setError(`Row ${i + 1}: select who this member is related to`);
        return;
      }
      if (r.phone && !/^[0-9]{10}$/.test(r.phone)) {
        setError(`Row ${i + 1}: phone number must be exactly 10 digits`);
        return;
      }
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
        members: rows.map((r) => {
          const [kind, value] = r.relativeKey.split(':');
          return {
            firstName: r.firstName.trim(),
            lastName: r.lastName.trim() || undefined,
            phone: r.phone.trim() || undefined,
            relation: r.relation,
            ...(kind === 'existing' ? { relativeId: value } : { relativeIndex: Number(value) }),
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
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {rows.map((row, index) => {
            const options = relativeOptionsFor(index);
            return (
              <div key={index} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Member {index + 1}</span>
                  {rows.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(index)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">First Name <span className="text-red-500">*</span></Label>
                    <Input value={row.firstName} onChange={(e) => updateRow(index, { firstName: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={row.lastName} onChange={(e) => updateRow(index, { lastName: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Relation <span className="text-red-500">*</span></Label>
                    <Select value={row.relation} onValueChange={(v) => updateRow(index, { relation: v ?? '' })}>
                      <SelectTrigger className="w-full">
                        {row.relation
                          ? <span data-slot="select-value" className="flex flex-1 text-left">{RELATIONS.find((r) => r.id === row.relation)?.label}</span>
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
                    <Select value={row.relativeKey} onValueChange={(v) => updateRow(index, { relativeKey: v ?? '' })}>
                      <SelectTrigger className="w-full">
                        {row.relativeKey
                          ? <span data-slot="select-value" className="flex flex-1 text-left">{options.find((o) => o.key === row.relativeKey)?.label}</span>
                          : <SelectValue placeholder="Select family member" />
                        }
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((o) => (
                          <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Phone (optional)</Label>
                  <Input value={row.phone} onChange={(e) => updateRow(index, { phone: e.target.value })} placeholder="10-digit number" />
                </div>

                {row.relation && row.relativeKey && row.firstName.trim() && (
                  <p className="text-xs text-muted-foreground">
                    ({row.firstName.trim()} is {RELATIONS.find((r) => r.id === row.relation)?.label.toLowerCase()} of{' '}
                    {relativeLabel(index, row.relativeKey)})
                  </p>
                )}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={addRow} className="w-fit gap-1">
            <Plus className="h-3.5 w-3.5" /> Add another member
          </Button>

          <p className="text-xs text-muted-foreground -mt-2">
            &quot;Related to&quot; only lists existing family members and members added earlier in this form.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving} className="bg-[#3230c4] hover:bg-[#494ad9]">
            {saving ? 'Adding...' : 'Add Member(s)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
