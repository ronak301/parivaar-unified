'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { states, getCitiesForState, getDistrictsForState } from '@/lib/locations';
import type { Community } from '@parivaar/shared';

export default function CommunityFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/admin/communities/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched community:', data.community);
          setCommunity(data.community);
        }
      } catch (err) {
        console.error('Failed to fetch community:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-black via-slate-900 to-black text-white rounded-t-2xl px-8 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Parivaar App</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Single Platform for Communities</h1>
              </div>
              <p className="mt-2 text-sm text-gray-400 max-w-2xl">Register your family with {community?.name}</p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-b-2xl border border-t-0 bg-white p-6 sm:p-8 space-y-5">
            {/* Photo Section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Photo Upload</p>
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">Profile photo (drag & drop or click)</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WebP · Max 3MB</p>
              </div>
            </div>

            <Separator />

            {/* Personal Info */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Personal Information</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Sampradaya</Label>
                  <Select onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sampradaya" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Terapanthi">Terapanthi</SelectItem>
                      <SelectItem value="Sthanakvasi">Sthanakvasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">First name *</Label>
                  <Input placeholder="John" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Last name *</Label>
                  <Input placeholder="Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Phone (10 digits) *</Label>
                  <Input placeholder="9876543210" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Email</Label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Date of birth</Label>
                  <Input type="date" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Guardian name</Label>
                  <Input placeholder="Parent name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Gender</Label>
                  <Select>
                    <SelectTrigger className="w-full">
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
                  <Label className="text-xs sm:text-sm">Wedding date</Label>
                  <Input type="date" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Education</Label>
                  <Input placeholder="e.g., Bachelor's Degree" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Special education</Label>
                  <Input placeholder="Certifications, degrees" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Blood group</Label>
                  <Select onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
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
                  <Label className="text-xs sm:text-sm">Native place</Label>
                  <Input placeholder="Village/city name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Native district</Label>
                  <Input placeholder="District name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Nanihaal</Label>
                  <Input placeholder="Location" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Hobbies</Label>
                  <Input placeholder="e.g., Reading, Sports" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Achievements</Label>
                  <Input placeholder="Awards, accomplishments" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Aadhar (last 4 digits)</Label>
                  <Input placeholder="1234" maxLength={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Address</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Full address</Label>
                  <Input placeholder="Street address, building, etc." />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">State</Label>
                  <Select value={state} onValueChange={(v) => v && setState(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
                  <Label className="text-xs sm:text-sm">City</Label>
                  <Select value={city} onValueChange={(v) => v && setCity(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {state &&
                        getCitiesForState(state).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">District</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={getDistrictsForState(state).length > 0 ? 'Select district' : 'Not available'} />
                    </SelectTrigger>
                    <SelectContent>
                      {state &&
                        getDistrictsForState(state).map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Locality</Label>
                  {(community?.localities ?? []).length > 0 ? (
                    <Select value={locality} onValueChange={(v) => v && setLocality(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select locality" />
                      </SelectTrigger>
                      <SelectContent>
                        {(community?.localities ?? []).map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Neighborhood/area" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Pincode (6 digits)</Label>
                  <Input placeholder="560001" maxLength={6} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Business */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Business (Optional)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Business name</Label>
                  <Input placeholder="Company name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Category</Label>
                  <Select>
                    <SelectTrigger className="w-full">
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
                  <Label className="text-xs sm:text-sm">Business phone</Label>
                  <Input placeholder="9876543210" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Website</Label>
                  <Input placeholder="https://example.com" />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Description</Label>
                  <Textarea placeholder="Business details..." rows={2} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Address</Label>
                  <Input placeholder="Business address" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">Instagram profile</Label>
                  <Input placeholder="https://instagram.com/..." />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs sm:text-sm">LinkedIn profile</Label>
                  <Input placeholder="https://linkedin.com/..." />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Google Maps link</Label>
                  <Input placeholder="https://maps.google.com/..." />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Logo</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled
                      className="text-xs sm:text-sm file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-muted-foreground file:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Photos (max 2)</Label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    disabled
                    className="text-xs sm:text-sm file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-muted-foreground file:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
