"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Community } from "@/lib/api/types";

export function CommunitiesTable({
  communities,
}: {
  communities: Community[];
}) {
  const router = useRouter();

  if (communities.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No communities yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Total Members</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communities.map((community) => (
            <TableRow
              key={community.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/communities/${community.id}`)}
            >
              <TableCell className="font-medium">{community.name}</TableCell>
              <TableCell>{community.totalMembers ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
