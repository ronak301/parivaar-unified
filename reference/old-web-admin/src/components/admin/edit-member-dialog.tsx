"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberAction } from "@/lib/actions/member";
import type { ConfigItem, Member, RemoteConfig } from "@/lib/api/types";

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

function diff<T extends Record<string, unknown>>(
  original: T,
  next: T
): Partial<T> {
  const changed: Partial<T> = {};
  for (const key of Object.keys(next) as (keyof T)[]) {
    if ((original[key] ?? "") !== (next[key] ?? "")) {
      changed[key] = next[key];
    }
  }
  return changed;
}

export function EditMemberDialog({
  communityId,
  member,
  config,
}: {
  communityId: string;
  member: Member;
  config: RemoteConfig | undefined;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(member.firstName ?? "");
  const [lastName, setLastName] = useState(member.lastName ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [guardianName, setGuardianName] = useState(member.guardianName ?? "");
  const [nativePlace, setNativePlace] = useState(member.nativePlace ?? "");
  const [gender, setGender] = useState(member.gender ?? "");
  const [education, setEducation] = useState(member.education ?? "");
  const [bloodGroup, setBloodGroup] = useState(member.bloodGroup ?? "");

  const [fullAddress, setFullAddress] = useState(
    member.address?.fullAddress ?? ""
  );
  const [locality, setLocality] = useState(member.address?.locality ?? "");
  const [state, setState] = useState(member.address?.state ?? "");
  const [city, setCity] = useState(member.address?.city ?? "");
  const [pincode, setPincode] = useState(member.address?.pincode ?? "");

  const [businessName, setBusinessName] = useState(member.business?.name ?? "");
  const [businessDescription, setBusinessDescription] = useState(
    member.business?.description ?? ""
  );
  const [businessPhone, setBusinessPhone] = useState(
    member.business?.phone ?? ""
  );
  const [website, setWebsite] = useState(member.business?.website ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const personal = diff(
        {
          firstName: member.firstName ?? "",
          lastName: member.lastName ?? "",
          email: member.email ?? "",
          guardianName: member.guardianName ?? "",
          nativePlace: member.nativePlace ?? "",
          gender: member.gender ?? "",
          education: member.education ?? "",
          bloodGroup: member.bloodGroup ?? "",
        },
        {
          firstName,
          lastName,
          email,
          guardianName,
          nativePlace,
          gender,
          education,
          bloodGroup,
        }
      );

      const address = diff(
        {
          fullAddress: member.address?.fullAddress ?? "",
          locality: member.address?.locality ?? "",
          state: member.address?.state ?? "",
          city: member.address?.city ?? "",
          pincode: member.address?.pincode ?? "",
        },
        { fullAddress, locality, state, city, pincode }
      );

      const business = diff(
        {
          name: member.business?.name ?? "",
          description: member.business?.description ?? "",
          phone: member.business?.phone ?? "",
          website: member.business?.website ?? "",
        },
        {
          name: businessName,
          description: businessDescription,
          phone: businessPhone,
          website,
        }
      );

      await updateMemberAction({
        memberId: member.id,
        communityId,
        addressId: member.address?.id,
        businessId: member.business?.id,
        personal,
        address,
        business,
      });
      toast.success("Member updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Pencil className="size-3.5" />
        Edit Information
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Personal Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guardianName">Guardian Name</Label>
                <Input
                  id="edit-guardianName"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nativePlace">Native Place</Label>
                <Input
                  id="edit-nativePlace"
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
                <Label htmlFor="edit-education">Education</Label>
                <Input
                  id="edit-education"
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
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Address
            </h3>
            <div className="space-y-2">
              <Label htmlFor="edit-fullAddress">Full Address</Label>
              <Textarea
                id="edit-fullAddress"
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
                <Label htmlFor="edit-pincode">Pincode</Label>
                <Input
                  id="edit-pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Business
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-businessName">Name</Label>
                <Input
                  id="edit-businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-businessPhone">Phone</Label>
                <Input
                  id="edit-businessPhone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-businessDescription">Description</Label>
                <Textarea
                  id="edit-businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
