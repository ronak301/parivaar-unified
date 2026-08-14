"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { uploadImage } from "@/lib/firebase/storage";
import {
  checkPhoneAction,
  submitFamilyRegistrationAction,
} from "@/lib/actions/public-registration";
import type { ConfigItem, RemoteConfig } from "@/lib/api/types";

const phoneRegex = /^\d{10}$/;

const headSchema = z.object({
  firstName: z.string().min(1, "Required").max(30),
  lastName: z.string().min(1, "Required").max(30),
  phone: z.string().regex(phoneRegex, "Enter a 10 digit phone number"),
  email: z.string().max(100).optional(),
  dob: z.string().max(20).optional(),
  guardianName: z.string().max(30).optional(),
  nativePlace: z.string().max(100).optional(),
  gender: z.string().max(30).optional(),
  weddingDate: z.string().max(20).optional(),
  education: z.string().max(200).optional(),
  bloodGroup: z.string().max(10).optional(),
  fullAddress: z.string().max(500).optional(),
  locality: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  pincode: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{6}$/.test(v), "Pincode must be 6 digits"),
  businessName: z.string().max(100).optional(),
  businessDescription: z.string().max(1000).optional(),
  businessPhone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), "Enter a 10 digit phone number"),
  website: z.string().max(300).optional(),
});

const familyMemberSchema = z.object({
  relationType: z.string().min(1, "Select a relation"),
  firstName: z.string().min(1, "Required").max(30),
  lastName: z.string().min(1, "Required").max(30),
  guardianName: z.string().max(30).optional(),
  gender: z.string().max(30).optional(),
  bloodGroup: z.string().max(10).optional(),
  education: z.string().max(200).optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), "Enter a 10 digit phone number"),
});

const formSchema = z.object({
  head: headSchema,
  familyMembers: z.array(familyMemberSchema),
});

type FormValues = z.infer<typeof formSchema>;

function ConfigSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: ConfigItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as string)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}`} />
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

function FamilyMemberRow({
  index,
  control,
  config,
  onRemove,
  errors,
}: {
  index: number;
  control: Control<FormValues>;
  config: RemoteConfig | undefined;
  onRemove: () => void;
  errors: FieldErrors<FormValues["familyMembers"][number]> | undefined;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Family member {index + 1}</p>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name={`familyMembers.${index}.relationType`}
          render={({ field }) => (
            <ConfigSelect
              label="Relation"
              options={config?.FamilyMemberRelationshipTypes ?? []}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors?.relationType && (
          <p className="col-span-2 -mt-3 text-xs text-destructive">
            {errors.relationType.message}
          </p>
        )}
        <div className="space-y-2">
          <Label>First Name</Label>
          <Controller
            control={control}
            name={`familyMembers.${index}.firstName`}
            render={({ field }) => <Input {...field} />}
          />
          {errors?.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Controller
            control={control}
            name={`familyMembers.${index}.lastName`}
            render={({ field }) => <Input {...field} />}
          />
          {errors?.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Phone (optional)</Label>
          <Controller
            control={control}
            name={`familyMembers.${index}.phone`}
            render={({ field }) => <Input type="tel" {...field} />}
          />
          {errors?.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Guardian Name</Label>
          <Controller
            control={control}
            name={`familyMembers.${index}.guardianName`}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        {config?.Gender && (
          <Controller
            control={control}
            name={`familyMembers.${index}.gender`}
            render={({ field }) => (
              <ConfigSelect
                label="Gender"
                options={config.Gender ?? []}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        )}
        {config?.BloodGroups && (
          <Controller
            control={control}
            name={`familyMembers.${index}.bloodGroup`}
            render={({ field }) => (
              <ConfigSelect
                label="Blood Group"
                options={config.BloodGroups ?? []}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        )}
        <div className="space-y-2">
          <Label>Education</Label>
          <Controller
            control={control}
            name={`familyMembers.${index}.education`}
            render={({ field }) => <Input {...field} />}
          />
        </div>
      </div>
    </div>
  );
}

export function FamilyRegistrationForm({
  communityId,
  config,
}: {
  communityId: string;
  config: RemoteConfig | undefined;
}) {
  const [step, setStep] = useState<"phone" | "existing" | "register" | "done" | "already-member">(
    "phone"
  );
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { head: { phone: phoneInput }, familyMembers: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers",
  });

  function startOver() {
    setStep("phone");
    setPhoneInput("");
    setPhoneError(null);
    setPhotoFile(null);
    reset({ head: { phone: "" }, familyMembers: [] });
  }

  async function handlePhoneContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneRegex.test(phoneInput)) {
      setPhoneError("Enter a 10 digit phone number");
      return;
    }
    setPhoneError(null);
    setPhoneChecking(true);
    try {
      const result = await checkPhoneAction(phoneInput, communityId);
      if (result.status === "already-member") {
        setStep("already-member");
      } else if (result.status === "existing") {
        setStep("existing");
      } else {
        setStep("register");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPhoneChecking(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      let profilePicture: string | undefined;
      if (photoFile) {
        profilePicture = await uploadImage(photoFile, `/user/${crypto.randomUUID()}`);
      }
      await submitFamilyRegistrationAction({
        communityId,
        head: {
          firstName: values.head.firstName,
          lastName: values.head.lastName,
          phone: values.head.phone,
          email: values.head.email || undefined,
          dob: values.head.dob || undefined,
          guardianName: values.head.guardianName || undefined,
          nativePlace: values.head.nativePlace || undefined,
          gender: values.head.gender || undefined,
          weddingDate: values.head.weddingDate || undefined,
          education: values.head.education || undefined,
          bloodGroup: values.head.bloodGroup || undefined,
          profilePicture,
          address: {
            fullAddress: values.head.fullAddress || undefined,
            locality: values.head.locality || undefined,
            state: values.head.state || undefined,
            city: values.head.city || undefined,
            pincode: values.head.pincode || undefined,
          },
          business: values.head.businessName
            ? {
                name: values.head.businessName,
                description: values.head.businessDescription || undefined,
                phone: values.head.businessPhone || undefined,
                website: values.head.website || undefined,
              }
            : undefined,
        },
        familyMembers: values.familyMembers.map((m) => ({
          relationType: m.relationType,
          firstName: m.firstName,
          lastName: m.lastName,
          guardianName: m.guardianName || undefined,
          gender: m.gender || undefined,
          bloodGroup: m.bloodGroup || undefined,
          education: m.education || undefined,
          phone: m.phone || undefined,
        })),
      });
      setStep("done");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="w-full space-y-4 rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Thank you!</h2>
        <p className="text-sm text-muted-foreground">
          Your family has been registered successfully.
        </p>
        <Button variant="outline" onClick={startOver} className="w-full">
          Register another family
        </Button>
      </div>
    );
  }

  if (step === "already-member") {
    return (
      <div className="w-full space-y-4 rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Already registered</h2>
        <p className="text-sm text-muted-foreground">
          This phone number is already a member of this community.
        </p>
        <Button variant="outline" onClick={() => setStep("phone")} className="w-full">
          Back
        </Button>
      </div>
    );
  }

  if (step === "phone") {
    return (
      <form
        onSubmit={handlePhoneContinue}
        className="w-full space-y-4 rounded-2xl border bg-background p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
          {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
        </div>
        <Button type="submit" disabled={phoneChecking} className="w-full">
          {phoneChecking ? "Checking..." : "Continue"}
        </Button>
      </form>
    );
  }

  if (step === "existing") {
    return (
      <div className="w-full space-y-4 rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Member already exists</h2>
        <p className="text-sm text-muted-foreground">
          This member already exists. Please contact the community admin to add them.
        </p>
        <Button variant="outline" onClick={() => setStep("phone")} className="w-full">
          Back
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-8 rounded-2xl border bg-background p-6 shadow-sm"
    >
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Personal Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("head.firstName")} />
            {errors.head?.firstName && (
              <p className="text-xs text-destructive">{errors.head.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("head.lastName")} />
            {errors.head?.lastName && (
              <p className="text-xs text-destructive">{errors.head.lastName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue={phoneInput} {...register("head.phone")} />
            {errors.head?.phone && (
              <p className="text-xs text-destructive">{errors.head.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("head.email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...register("head.dob")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input id="guardianName" {...register("head.guardianName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nativePlace">Native Place</Label>
            <Input id="nativePlace" {...register("head.nativePlace")} />
          </div>
          {config?.Gender && (
            <Controller
              control={control}
              name="head.gender"
              render={({ field }) => (
                <ConfigSelect
                  label="Gender"
                  options={config.Gender ?? []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="weddingDate">Wedding Date</Label>
            <Input id="weddingDate" type="date" {...register("head.weddingDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input id="education" {...register("head.education")} />
          </div>
          {config?.BloodGroups && (
            <Controller
              control={control}
              name="head.bloodGroup"
              render={({ field }) => (
                <ConfigSelect
                  label="Blood Group"
                  options={config.BloodGroups ?? []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
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
          <Textarea id="fullAddress" {...register("head.fullAddress")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {config?.Localities && (
            <Controller
              control={control}
              name="head.locality"
              render={({ field }) => (
                <ConfigSelect
                  label="Locality"
                  options={config.Localities ?? []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          {config?.State && (
            <Controller
              control={control}
              name="head.state"
              render={({ field }) => (
                <ConfigSelect
                  label="State"
                  options={config.State ?? []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          {config?.Cities && (
            <Controller
              control={control}
              name="head.city"
              render={({ field }) => (
                <ConfigSelect
                  label="City"
                  options={config.Cities ?? []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("head.pincode")} />
            {errors.head?.pincode && (
              <p className="text-xs text-destructive">{errors.head.pincode.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Business (optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Name</Label>
            <Input id="businessName" {...register("head.businessName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Phone</Label>
            <Input id="businessPhone" type="tel" {...register("head.businessPhone")} />
            {errors.head?.businessPhone && (
              <p className="text-xs text-destructive">{errors.head.businessPhone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("head.website")} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="businessDescription">Description</Label>
            <Textarea id="businessDescription" {...register("head.businessDescription")} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Family Members</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                relationType: "",
                firstName: "",
                lastName: "",
                guardianName: "",
                gender: "",
                bloodGroup: "",
                education: "",
                phone: "",
              })
            }
          >
            <Plus className="size-3.5" />
            Add Family Member
          </Button>
        </div>
        {fields.map((field, index) => (
          <FamilyMemberRow
            key={field.id}
            index={index}
            control={control}
            config={config}
            onRemove={() => remove(index)}
            errors={errors.familyMembers?.[index]}
          />
        ))}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
