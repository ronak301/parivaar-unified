"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { updateCommunityAction } from "@/lib/actions/community";
import type { Community, RemoteConfig } from "@/lib/api/types";

function DetailBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

export function CommunityInfoTab({
  community,
  config,
}: {
  community: Community;
  config: RemoteConfig | undefined;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(community.name ?? "");
  const [description, setDescription] = useState(community.description ?? "");
  const [type, setType] = useState(community.type ?? "");
  const [subType, setSubType] = useState(community.subType ?? "");

  const communityTypes = config?.CommunityTypes ?? [];
  const subTypes = communityTypes.find((t) => t.label === type)?.subTypes ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCommunityAction(community.id, {
        name,
        description,
        type,
        subType,
      });
      toast.success("Community updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update community");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <DetailBox label="Name" value={community.name} />
            <DetailBox label="Type" value={community.type} />
            <DetailBox label="Sub Type" value={community.subType} />
            <DetailBox label="Status" value={community.status} />
            <DetailBox
              label="Description"
              value={community.description}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              <Pencil className="size-3.5" />
              Edit
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Community</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Community Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value as string);
                      setSubType("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {communityTypes.map((t) => (
                        <SelectItem key={t.id} value={t.label}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {subTypes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub Type</Label>
                    <Select
                      value={subType}
                      onValueChange={(value) => setSubType(value as string)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sub type" />
                      </SelectTrigger>
                      <SelectContent>
                        {subTypes.map((t) => (
                          <SelectItem key={t.id} value={t.label}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
