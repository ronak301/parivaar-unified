"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CreateMemberForm } from "@/components/admin/create-member-form";
import {
  searchMemberAction,
  createMemberAction,
  updateAndAddExistingMemberAction,
  type CreateMemberInput,
} from "@/lib/actions/member";
import type { Member, RemoteConfig } from "@/lib/api/types";

type Step = "phone" | "exists" | "new";

export function AddFamilyMemberDialog({
  communityId,
  parentId,
  config,
}: {
  communityId: string;
  parentId: string;
  config: RemoteConfig | undefined;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [foundUser, setFoundUser] = useState<Member | null>(null);
  const [relationType, setRelationType] = useState("");

  const relationTypes = config?.FamilyMemberRelationshipTypes ?? [];

  function reset() {
    setStep("phone");
    setPhone("");
    setFoundUser(null);
    setRelationType("");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      setStep("new");
      return;
    }
    setLoading(true);
    try {
      const result = await searchMemberAction(phone);
      if (result.count > 0) {
        setFoundUser(result.rows[0]);
        setStep("exists");
      } else {
        setStep("new");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveExisting(input: CreateMemberInput) {
    if (!foundUser) return;
    setLoading(true);
    try {
      await updateAndAddExistingMemberAction({
        memberId: foundUser.id,
        communityId,
        addressId: foundUser.address?.id,
        businessId: foundUser.business?.id,
        personal: input.personal,
        address: input.address,
        business: input.business,
      });
      toast.success("Member updated and added");
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      toast.error("Failed to save member");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNew(input: CreateMemberInput) {
    if (!relationType) {
      toast.error("Select a relation type");
      return;
    }
    await createMemberAction({
      ...input,
      parentId,
      relationType,
    });
    toast.success("Family member added");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <UserPlus className="size-3.5" />
        Add Family Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="family-phone">Phone Number (optional)</Label>
              <Input
                id="family-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Searching..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "exists" && foundUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Existing member found — review and update their info, then save
              to add them to this community.
            </p>
            <CreateMemberForm
              phone={foundUser.phone ?? phone}
              communityId={communityId}
              config={config}
              onSubmit={handleSaveExisting}
              submitLabel="Save & Add to Community"
              initialValues={foundUser}
            />
          </div>
        )}

        {step === "new" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Relationship Type</Label>
              <Select
                value={relationType}
                onValueChange={(v) => setRelationType(v as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  {relationTypes.map((t) => (
                    <SelectItem key={t.id} value={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CreateMemberForm
              phone={phone}
              communityId={communityId}
              config={config}
              onSubmit={handleCreateNew}
              submitLabel="Add Family Member"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
