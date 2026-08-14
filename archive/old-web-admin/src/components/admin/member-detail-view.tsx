"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditMemberDialog } from "@/components/admin/edit-member-dialog";
import { AddFamilyMemberDialog } from "@/components/admin/add-family-member-dialog";
import type { Member, RemoteConfig } from "@/lib/api/types";

function DetailBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return undefined;
  try {
    return format(new Date(value), "PP");
  } catch {
    return value;
  }
}

export function MemberDetailView({
  communityId,
  member,
  config,
}: {
  communityId: string;
  member: Member;
  config: RemoteConfig | undefined;
}) {
  const isFamilyHead = member.parent === null || member.parent === undefined;
  const relatives = (member.relatives ?? []).filter((r) =>
    r.communities?.some((c) => c.id === communityId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">{member.phone}</p>
        </div>
        <div className="flex gap-2">
          {isFamilyHead && (
            <AddFamilyMemberDialog
              communityId={communityId}
              parentId={member.id}
              config={config}
            />
          )}
          <EditMemberDialog
            communityId={communityId}
            member={member}
            config={config}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <DetailBox label="First Name" value={member.firstName} />
          <DetailBox label="Last Name" value={member.lastName} />
          <DetailBox label="Date of Birth" value={formatDate(member.dob)} />
          <DetailBox label="Phone" value={member.phone} />
          <DetailBox label="Blood Group" value={member.bloodGroup} />
          <DetailBox label="Guardian Name" value={member.guardianName} />
          <DetailBox label="Gender" value={member.gender} />
          <DetailBox label="Education" value={member.education} />
          <DetailBox label="Native Place" value={member.nativePlace} />
          <DetailBox
            label="Wedding Date"
            value={formatDate(member.weddingDate)}
          />
          <DetailBox label="Email" value={member.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <DetailBox label="Pincode" value={member.address?.pincode} />
          <DetailBox label="City" value={member.address?.city} />
          <DetailBox label="Locality" value={member.address?.locality} />
          <DetailBox label="State" value={member.address?.state} />
          <DetailBox
            label="Full Address"
            value={member.address?.fullAddress}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <DetailBox label="Name" value={member.business?.name} />
          <DetailBox label="Phone" value={member.business?.phone} />
          <DetailBox
            label="Website"
            value={
              member.business?.website ? (
                <a
                  href={member.business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {member.business.website}
                </a>
              ) : undefined
            }
          />
          <DetailBox
            label="Description"
            value={member.business?.description}
          />
        </CardContent>
      </Card>

      {!isFamilyHead && member.parent && (
        <Card>
          <CardHeader>
            <CardTitle>Family Head</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {member.parent.firstName} {member.parent.lastName}
                  </TableCell>
                  <TableCell>{member.parent.phone}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isFamilyHead && relatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Relation Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatives.map((relative) => (
                  <TableRow key={relative.id}>
                    <TableCell>
                      {relative.firstName} {relative.lastName}
                    </TableCell>
                    <TableCell>{relative.phone}</TableCell>
                    <TableCell>{(relative.relationType as string | undefined) ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
