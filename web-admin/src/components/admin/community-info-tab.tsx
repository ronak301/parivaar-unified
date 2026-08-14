'use client';

import { useState } from 'react';
import type { Community, FamilyDetailsType } from '@parivaar/shared';
import { CommunityTypes, CommunityStatus } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SHOW_FAMILY_MEMBERS_OPTIONS: FamilyDetailsType[] = [
  'ALL',
  'SINGLE',
  'SPOUSE',
  'SPOUSE_AND_KIDS',
];

export function CommunityInfoTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const [form, setForm] = useState({
    name: community.name ?? '',
    description: community.description ?? '',
    contactPersonName: community.contactPersonName ?? '',
    contactPersonNumber: community.contactPersonNumber ?? '',
    state: community.state ?? '',
    city: community.city ?? '',
    status: community.status ?? '',
    type: community.type ?? '',
    subType: community.subType ?? '',
    showFamilyMembers: community.showFamilyMembers ?? '',
    welcomeScreen: community.features?.welcomeScreen ?? false,
    aboutScreenExtraInfo: community.features?.aboutScreenExtraInfo ?? false,
    showOnlyHeadsInAllMembers:
      community.features?.showOnlyHeadsInAllMembers ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedType = CommunityTypes.find((t) => t.id === form.type);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/communities/${community._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          contactPersonName: form.contactPersonName || undefined,
          contactPersonNumber: form.contactPersonNumber || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          status: form.status || undefined,
          type: form.type || undefined,
          subType: form.subType || undefined,
          showFamilyMembers: form.showFamilyMembers || undefined,
          features: {
            welcomeScreen: form.welcomeScreen,
            aboutScreenExtraInfo: form.aboutScreenExtraInfo,
            showOnlyHeadsInAllMembers: form.showOnlyHeadsInAllMembers,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save changes');
        return;
      }

      onUpdated(data.community);
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status || undefined}
              onValueChange={(value) => set('status', String(value))}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CommunityStatus.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.type || undefined}
              onValueChange={(value) => {
                set('type', String(value));
                set('subType', '');
              }}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CommunityTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType?.subTypes && selectedType.subTypes.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="subType">Sub Type</Label>
              <Select
                value={form.subType || undefined}
                onValueChange={(value) => set('subType', String(value))}
              >
                <SelectTrigger id="subType" className="w-full">
                  <SelectValue placeholder="Select sub type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedType.subTypes.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="contactPersonName">Contact Person</Label>
            <Input
              id="contactPersonName"
              value={form.contactPersonName}
              onChange={(e) => set('contactPersonName', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contactPersonNumber">Contact Number</Label>
            <Input
              id="contactPersonNumber"
              value={form.contactPersonNumber}
              onChange={(e) => set('contactPersonNumber', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="showFamilyMembers">Show Family Members</Label>
            <Select
              value={form.showFamilyMembers || undefined}
              onValueChange={(value) =>
                set('showFamilyMembers', value as FamilyDetailsType)
              }
            >
              <SelectTrigger id="showFamilyMembers" className="w-full">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {SHOW_FAMILY_MEMBERS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <span className="text-sm font-medium">Features</span>
          {(
            [
              ['welcomeScreen', 'Welcome screen'],
              ['aboutScreenExtraInfo', 'About screen extra info'],
              ['showOnlyHeadsInAllMembers', 'Show only heads in all members'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-600">Changes saved.</p>
        )}

        <div>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
