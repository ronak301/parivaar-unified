"use client";

import { useState } from "react";
import { Plus, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATES, CITIES } from "@/lib/data/india";
import type { RemoteConfig } from "@/lib/api/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Dropdown({
  label,
  options,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string | null) => void;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}`}>
            {(v: string | null) =>
              options.find((o) => o.id === v)?.label ??
              placeholder ??
              `Select ${label.toLowerCase()}`
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b pb-2 text-sm font-semibold tracking-tight">
      {children}
    </h3>
  );
}

function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <label className="group relative flex size-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/40 transition-colors hover:border-primary/50 hover:bg-muted/60">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="size-full rounded-full object-cover"
        />
      ) : (
        <>
          <Camera className="size-5 text-muted-foreground/50 group-hover:text-primary/70" />
          <span className="mt-0.5 text-[9px] text-muted-foreground/50 group-hover:text-primary/70">
            Photo
          </span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}

function BusinessSection({ config }: { config: RemoteConfig | undefined }) {
  return (
    <div className="space-y-4">
      <SectionTitle>Business (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Business Name">
          <Input placeholder="Business name" />
        </Field>
        <Dropdown
          label="Business Category"
          options={config?.BusinessTypes ?? []}
          placeholder="Select category"
        />
        <Field label="Business Phone">
          <Input type="tel" placeholder="10-digit phone" />
        </Field>
        <Field label="Website">
          <Input placeholder="https://..." />
        </Field>
        <div className="col-span-2">
          <Field label="Description">
            <Textarea placeholder="Describe the business" rows={3} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function FamilyMemberCard({
  index,
  config,
  onRemove,
}: {
  index: number;
  config: RemoteConfig | undefined;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Family Member {index + 1}</p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Photo */}
      <div className="flex justify-center">
        <PhotoUpload />
      </div>

      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-4">
        <Dropdown
          label="Relation"
          options={config?.FamilyMemberRelationshipTypes ?? []}
          placeholder="Select relation"
        />
        <Field label="First Name">
          <Input placeholder="First name" />
        </Field>
        <Field label="Last Name">
          <Input placeholder="Last name" />
        </Field>
        <Field label="Phone">
          <Input type="tel" placeholder="10-digit phone" />
        </Field>
        <Field label="Guardian Name">
          <Input placeholder="Guardian name" />
        </Field>
        <Dropdown label="Gender" options={config?.Gender ?? []} />
        <Dropdown label="Blood Group" options={config?.BloodGroups ?? []} />
        <Field label="Education">
          <Input placeholder="Education" />
        </Field>
        <Field label="Date of Birth">
          <Input type="date" />
        </Field>
        <Field label="Wedding Date">
          <Input type="date" />
        </Field>
      </div>

      {/* Business */}
      <div className="space-y-6 border-t pt-4">
        <BusinessSection config={config} />
      </div>
    </div>
  );
}

export function FormShowcase({
  config,
  localities,
}: {
  config: RemoteConfig | undefined;
  localities: string[];
}) {
  const [familyCount, setFamilyCount] = useState(1);
  const [headPhoto, setHeadPhoto] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState("");

  function handleHeadPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setHeadPhoto(URL.createObjectURL(file));
  }

  const localityOptions = localities.map((l) => ({ id: l, label: l }));
  const cityOptions = selectedState ? (CITIES[selectedState] ?? []) : [];

  return (
    <div className="space-y-8">
      {/* Header + Personal Info */}
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        {/* Head Photo */}
        <div className="mb-6 flex justify-center">
          <label className="group relative flex size-28 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/40 transition-colors hover:border-primary/50 hover:bg-muted/60">
            {headPhoto ? (
              <img
                src={headPhoto}
                alt="Profile preview"
                className="size-full rounded-full object-cover"
              />
            ) : (
              <>
                <Camera className="size-6 text-muted-foreground/50 group-hover:text-primary/70" />
                <span className="mt-1 text-[10px] text-muted-foreground/50 group-hover:text-primary/70">
                  Upload Photo
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeadPhotoChange}
            />
          </label>
        </div>

        <div className="space-y-4">
          <SectionTitle>Head of Family — Personal Info</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <Input placeholder="First name" />
            </Field>
            <Field label="Last Name">
              <Input placeholder="Last name" />
            </Field>
            <Field label="Phone Number">
              <Input type="tel" placeholder="10-digit phone number" />
            </Field>
            <Field label="Email">
              <Input type="email" placeholder="email@example.com" />
            </Field>
            <Field label="Date of Birth">
              <Input type="date" />
            </Field>
            <Field label="Guardian Name">
              <Input placeholder="Father / Husband name" />
            </Field>
            <Field label="Native Place">
              <Input placeholder="Native place" />
            </Field>
            <Field label="Native District">
              <Input placeholder="Native district" />
            </Field>
            <Dropdown label="Gender" options={config?.Gender ?? []} />
            <Field label="Wedding Date">
              <Input type="date" />
            </Field>
            <Field label="Education">
              <Input placeholder="Education" />
            </Field>
            <Dropdown
              label="Blood Group"
              options={config?.BloodGroups ?? []}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="space-y-4">
          <SectionTitle>Address</SectionTitle>
          <Field label="Full Address">
            <Textarea placeholder="Full address" rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            {localityOptions.length > 0 && (
              <Dropdown
                label="Locality"
                options={localityOptions}
                placeholder="Select locality"
              />
            )}
            <Dropdown
              label="State"
              options={STATES}
              placeholder="Select state"
              value={selectedState}
              onChange={(v) => setSelectedState(v ?? "")}
            />
            <Dropdown
              label="City"
              options={cityOptions}
              placeholder={
                selectedState ? "Select city" : "Select state first"
              }
            />
            <Field label="Pincode">
              <Input placeholder="6-digit pincode" />
            </Field>
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <BusinessSection config={config} />
      </div>

      {/* Family Members */}
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle>Family Members</SectionTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFamilyCount((c) => c + 1)}
            >
              <Plus className="size-3.5" />
              Add Member
            </Button>
          </div>
          {Array.from({ length: familyCount }).map((_, i) => (
            <FamilyMemberCard
              key={i}
              index={i}
              config={config}
              onRemove={() => setFamilyCount((c) => Math.max(0, c - 1))}
            />
          ))}
          {familyCount === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Click &quot;Add Member&quot; to add family members
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
