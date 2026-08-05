"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddMemberDialog } from "@/components/admin/add-member-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { removeMemberAction } from "@/lib/actions/member";
import type { Member, RemoteConfig } from "@/lib/api/types";

const PAGE_SIZE = 10;

export function MembersTab({
  communityId,
  config,
}: {
  communityId: string;
  config: RemoteConfig | undefined;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    rows: Member[];
    count: number;
  } | null>(null);
  const debouncedQuery = useDebouncedValue(query);
  const requestKey = `${communityId}:${page}:${debouncedQuery}`;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityId,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        query: debouncedQuery,
      }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          rows: body.members?.rows ?? [],
          count: body.members?.count ?? 0,
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load members");
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, page, debouncedQuery, requestKey]);

  const loading = result?.key !== requestKey;
  const members = result?.rows ?? [];
  const count = result?.count ?? 0;

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(0);
  }

  async function handleRemove(userId: string) {
    try {
      await removeMemberAction(communityId, userId);
      toast.success("Member removed");
      setResult((prev) =>
        prev ? { ...prev, rows: prev.rows.filter((m) => m.id !== userId) } : prev
      );
    } catch {
      toast.error("Failed to remove member");
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function copyFormLink() {
    const url = `${window.location.origin}/community/${communityId}/form`;
    navigator.clipboard.writeText(url);
    toast.success("Form link copied");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search by name or phone"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyFormLink}>
            <LinkIcon className="size-3.5" />
            Copy form link
          </Button>
          <AddMemberDialog communityId={communityId} config={config} />
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/admin/communities/${communityId}/members/${member.id}`
                    )
                  }
                >
                  <TableCell className="font-medium">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.address?.locality ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          />
                        }
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes {member.firstName} {member.lastName}{" "}
                            from this community.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleRemove(member.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
