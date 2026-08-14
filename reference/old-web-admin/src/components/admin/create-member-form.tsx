"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadImage } from "@/lib/firebase/storage";
import type { ConfigItem, Member, RemoteConfig } from "@/lib/api/types";
import type { CreateMemberInput } from "@/lib/actions/member";

function ConfigSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ConfigItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as string)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.label}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CreateMemberForm({
  phone,
  communityId,
  config,
  onSubmit,
  submitLabel = "Add Member",
  initialValues,
}: {
  phone: string;
  communityId: string;
  config: RemoteConfig | undefined;
  onSubmit: (input: CreateMemberInput) => Promise<void>;
  submitLabel?: string;
  initialValues?: Partial<Member>;
}) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [firstName, setFirstName] = useState(initialValues?.firstName ?? "");
  const [lastName, setLastName] = useState(initialValues?.lastName ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [dob, setDob] = useState(initialValues?.dob ?? "");
  const [guardianName, setGuardianName] = useState(initialValues?.guardianName ?? "");
  const [nativePlace, setNativePlace] = useState(initialValues?.nativePlace ?? "");
  const [gender, setGender] = useState(initialValues?.gender ?? "");
  const [weddingDate, setWeddingDate] = useState(initialValues?.weddingDate ?? "");
  const [education, setEducation] = useState(initialValues?.education ?? "");
  const [bloodGroup, setBloodGroup] = useState(initialValues?.bloodGroup ?? "");

  const [fullAddress, setFullAddress] = useState(
    initialValues?.address?.fullAddress ?? ""
  );
  const [locality, setLocality] = useState(initialValues?.address?.locality ?? "");
  const [state, setState] = useState(initialValues?.address?.state ?? "");
  const [city, setCity] = useState(initialValues?.address?.city ?? "");
  const [pincode, setPincode] = useState(initialValues?.address?.pincode ?? "");

  const [businessName, setBusinessName] = useState(initialValues?.business?.name ?? "");
  const [businessDescription, setBusinessDescription] = useState(
    initialValues?.business?.description ?? ""
  );
  const [businessPhone, setBusinessPhone] = useState(
    initialValues?.business?.phone ?? ""
  );
  const [website, setWebsite] = useState(initialValues?.business?.website ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let profilePicture: string | undefined;
      if (photoFile) {
        profilePicture = await uploadImage(photoFile, `/user/${Date.now()}`);
      }

      await onSubmit({
        personal: {
          firstName,
          lastName,
          phone,
          email: email || undefined,
          dob: dob || undefined,
          guardianName: guardianName || undefined,
          nativePlace: nativePlace || undefined,
          gender: gender || undefined,
          weddingDate: weddingDate || undefined,
          education: education || undefined,
          bloodGroup: bloodGroup || undefined,
          profilePicture,
        },
        address: {
          fullAddress: fullAddress || undefined,
          locality: locality || undefined,
          state: state || undefined,
          city: city || undefined,
          pincode: pincode || undefined,
        },
        business: businessName
          ? {
              name: businessName,
              description: businessDescription || undefined,
              phone: businessPhone || undefined,
              website: website || undefined,
            }
          : undefined,
        communityId,
      });
    } catch {
      toast.error("Failed to save member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Personal Info
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input
              id="guardianName"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nativePlace">Native Place</Label>
            <Input
              id="nativePlace"
              value={nativePlace}
              onChange={(e) => setNativePlace(e.target.value)}
            />
          </div>
          {config?.Gender && (
            <ConfigSelect
              label="Gender"
              options={config.Gender}
              value={gender}
              onChange={setGender}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="weddingDate">Wedding Date</Label>
            <Input
              id="weddingDate"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />
          </div>
          {config?.BloodGroups && (
            <ConfigSelect
              label="Blood Group"
              options={config.BloodGroups}
              value={bloodGroup}
              onChange={setBloodGroup}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo">Profile Photo</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
        <div className="space-y-2">
          <Label htmlFor="fullAddress">Full Address</Label>
          <Textarea
            id="fullAddress"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {config?.Localities && (
            <ConfigSelect
              label="Locality"
              options={config.Localities}
              value={locality}
              onChange={setLocality}
            />
          )}
          {config?.State && (
            <ConfigSelect
              label="State"
              options={config.State}
              value={state}
              onChange={setState}
            />
          )}
          {config?.Cities && (
            <ConfigSelect
              label="City"
              options={config.Cities}
              value={city}
              onChange={setCity}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Business (optional)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Phone</Label>
            <Input
              id="businessPhone"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="businessDescription">Description</Label>
            <Textarea
              id="businessDescription"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
