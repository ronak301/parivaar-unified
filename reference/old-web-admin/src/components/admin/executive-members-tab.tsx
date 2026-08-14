"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Member } from "@/lib/api/types";

export function ExecutiveMembersTab({ executives }: { executives: Member[] }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return executives;
    return executives.filter((member) => {
      const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.toLowerCase();
      return fullName.startsWith(q) || member.phone?.includes(q);
    });
  }, [executives, debouncedQuery]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or phone"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No executive members.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell>{member.bloodGroup ?? "-"}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.executive?.roles?.[0] ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
