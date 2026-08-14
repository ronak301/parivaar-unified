"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateMemberForm } from "@/components/admin/create-member-form";
import {
  searchMemberAction,
  addExistingMemberAction,
  createMemberAction,
  type CreateMemberInput,
} from "@/lib/actions/member";
import type { Member, RemoteConfig } from "@/lib/api/types";

type Step = "phone" | "exists" | "new";

export function AddMemberDialog({
  communityId,
  config,
}: {
  communityId: string;
  config: RemoteConfig | undefined;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [foundUser, setFoundUser] = useState<Member | null>(null);

  function reset() {
    setStep("phone");
    setPhone("");
    setFoundUser(null);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await searchMemberAction(phone);
      if (result.count > 0) {
        const user = result.rows[0];
        const alreadyInCommunity = user.communities?.some(
          (c) => c.id === communityId
        );
        if (alreadyInCommunity) {
          toast.error("User already exists in this community");
          return;
        }
        setFoundUser(user);
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

  async function handleAddExisting() {
    if (!foundUser) return;
    setLoading(true);
    try {
      await addExistingMemberAction(communityId, foundUser.id);
      toast.success("Member added");
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNew(input: CreateMemberInput) {
    await createMemberAction(input);
    toast.success("Member added");
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
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Add Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Searching..." : "Search"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "exists" && foundUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar size="lg">
                <AvatarImage src={foundUser.profilePicture} />
                <AvatarFallback>
                  {foundUser.firstName?.[0]}
                  {foundUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {foundUser.firstName} {foundUser.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {foundUser.education}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("phone")}>
                Cancel
              </Button>
              <Button onClick={handleAddExisting} disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "new" && (
          <CreateMemberForm
            phone={phone}
            communityId={communityId}
            config={config}
            onSubmit={handleCreateNew}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
