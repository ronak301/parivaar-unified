"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { setCommunityLocalities } from "@/lib/firebase/community-config";

export function LocalitiesTab({
  communityId,
  initialLocalities,
}: {
  communityId: string;
  initialLocalities: string[];
}) {
  const [localities, setLocalities] = useState<string[]>(initialLocalities);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(updated: string[]) {
    setSaving(true);
    try {
      await setCommunityLocalities(communityId, updated);
      setLocalities(updated);
      toast.success("Localities updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleAdd() {
    const value = input.trim();
    if (!value) return;
    if (localities.includes(value)) {
      toast.error("Already exists");
      return;
    }
    save([...localities, value]);
    setInput("");
  }

  function handleRemove(locality: string) {
    save(localities.filter((l) => l !== locality));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Localities</p>
          <p className="text-xs text-muted-foreground">
            These localities will appear as dropdown options in the registration
            form for this community.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a locality"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={saving || !input.trim()}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {localities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localities.map((l) => (
              <Badge
                key={l}
                variant="secondary"
                className="gap-1 pr-1 text-sm"
              >
                {l}
                <button
                  type="button"
                  onClick={() => handleRemove(l)}
                  disabled={saving}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No localities added yet. Add localities that members can select from
            during registration.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
