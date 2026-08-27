'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import type { ApprovalRequest, ApprovalStatus } from '@parivaar/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@chakra-ui/react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_FILTERS: ApprovalStatus[] = ['pending', 'approved', 'rejected'];

const RELATION_LABELS: Record<string, string> = {
  father: 'Father',
  mother: 'Mother',
  spouse: 'Spouse',
  child: 'Child',
  son: 'Son',
  daughter: 'Daughter',
  sibling: 'Sibling',
};

interface HeadPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  guardianName?: string;
  nativePlace?: string;
  nativeDistrict?: string;
  nanihaal?: string;
  education?: string;
  bloodGroup?: string;
  aadharLast4?: string;
  address?: {
    fullAddress?: string;
    state?: string;
    city?: string;
    district?: string;
    locality?: string;
    pincode?: string;
  };
}

interface MemberPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  relation?: string;
  relativeIndex?: number;
}

interface BusinessPayload {
  name?: string;
  category?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  instagramProfile?: string;
  linkedinProfile?: string;
  googleMapsLink?: string;
}

function fullName(p?: { firstName?: string; lastName?: string }): string {
  if (!p) return '';
  return [p.firstName, p.lastName].filter(Boolean).join(' ');
}

function requesterName(request: ApprovalRequest): string {
  const requestedBy = request.requestedBy as unknown;
  if (requestedBy && typeof requestedBy === 'object') {
    const r = requestedBy as { fullName?: string; firstName?: string; lastName?: string };
    return r.fullName ?? ([r.firstName, r.lastName].filter(Boolean).join(' ') || '-');
  }
  const submitterName = request.payload?.submitterName;
  if (typeof submitterName === 'string' && submitterName) return `${submitterName} (public)`;
  return '-';
}

function familyMembers(request: ApprovalRequest) {
  const head = request.payload?.head as HeadPayload | undefined;
  const members = (request.payload?.members as MemberPayload[] | undefined) ?? [];
  const headName = fullName(head) || 'Head';

  const list: Array<{ key: string; name: string; relationText: string; isHead: boolean }> = [
    { key: 'head', name: headName, relationText: 'Head', isHead: true },
  ];

  members.forEach((m, idx) => {
    const name = fullName(m) || `Member ${idx + 1}`;
    let relationText = '-';
    if (m.relation) {
      const label = RELATION_LABELS[m.relation] ?? m.relation;
      const relatedName =
        m.relativeIndex === -1
          ? headName
          : typeof m.relativeIndex === 'number'
            ? fullName(members[m.relativeIndex])
            : '';
      relationText = relatedName ? `${label} of ${relatedName}` : label;
    }
    list.push({ key: `m-${idx}`, name, relationText, isHead: false });
  });

  return list;
}

function DetailField({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function RequestDetailsDialog({
  request,
  open,
  onOpenChange,
  onReview,
  acting,
}: {
  request: ApprovalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (id: string, status: 'approved' | 'rejected') => void;
  acting: boolean;
}) {
  if (!request) return null;

  const isNewFamily = request.entityType === 'new_family';
  const head = request.payload?.head as HeadPayload | undefined;
  const business = request.payload?.business as BusinessPayload | undefined;
  const members = (request.payload?.members as MemberPayload[] | undefined) ?? [];
  const sampradaya = request.payload?.sampradaya as string | undefined;
  const submitterName = request.payload?.submitterName as string | undefined;
  const submitterPhone = request.payload?.submitterPhone as string | undefined;
  const addressLine = [
    head?.address?.fullAddress,
    head?.address?.locality,
    head?.address?.city,
    head?.address?.district,
    head?.address?.state,
    head?.address?.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewFamily ? 'New Family Registration' : request.entityType.replace(/_/g, ' ')}</DialogTitle>
          <DialogDescription>
            Requested by {requesterName(request)}
            {request.createdAt ? ` on ${new Date(request.createdAt).toLocaleDateString()}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {isNewFamily && (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">Family Head</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <DetailField label="Name" value={fullName(head)} />
                  <DetailField label="Phone" value={head?.phone} />
                  <DetailField label="Email" value={head?.email} />
                  <DetailField label="Gender" value={head?.gender} />
                  <DetailField label="DOB" value={head?.dob} />
                  <DetailField label="Guardian" value={head?.guardianName} />
                  <DetailField label="Native Place" value={head?.nativePlace} />
                  <DetailField label="Native District" value={head?.nativeDistrict} />
                  <DetailField label="Nanihaal" value={head?.nanihaal} />
                  <DetailField label="Education" value={head?.education} />
                  <DetailField label="Blood Group" value={head?.bloodGroup} />
                  <DetailField label="Aadhar (last 4)" value={head?.aadharLast4} />
                  <DetailField label="Sampradaya" value={sampradaya} />
                  <DetailField label="Address" value={addressLine} />
                </div>
              </div>

              {members.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-foreground">Members ({members.length})</p>
                  <div className="flex flex-col gap-2">
                    {familyMembers(request)
                      .filter((m) => !m.isHead)
                      .map((m, idx) => (
                        <div
                          key={m.key}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{m.name}</span>
                          <Badge variant="outline" className="font-normal">{m.relationText}</Badge>
                          {members[idx]?.phone && (
                            <span className="text-muted-foreground">{members[idx].phone}</span>
                          )}
                          {members[idx]?.gender && (
                            <span className="text-muted-foreground">{members[idx].gender}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {business && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-foreground">Business</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <DetailField label="Name" value={business.name} />
                    <DetailField label="Category" value={business.category} />
                    <DetailField label="Phone" value={business.phone} />
                    <DetailField label="Website" value={business.website} />
                    <DetailField label="Address" value={business.address} />
                    <DetailField label="Instagram" value={business.instagramProfile} />
                    <DetailField label="LinkedIn" value={business.linkedinProfile} />
                    <DetailField label="Google Maps" value={business.googleMapsLink} />
                    <DetailField label="Description" value={business.description} />
                  </div>
                </div>
              )}

              {(submitterName || submitterPhone) && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-foreground">Submitted By</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <DetailField label="Name" value={submitterName} />
                    <DetailField label="Phone" value={submitterPhone} />
                  </div>
                </div>
              )}
            </>
          )}

          {!isNewFamily && (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {JSON.stringify(request.payload, null, 2)}
            </pre>
          )}
        </div>

        {request.status === 'pending' && (
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={acting}
              onClick={() => onReview(request._id, 'rejected')}
            >
              Reject
            </Button>
            <Button
              disabled={acting}
              onClick={() => onReview(request._id, 'approved')}
            >
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CommunityApprovalsTab({ communityId }: { communityId: string }) {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);

  const load = useCallback(() => {
    startTransition(() => {
      setLoading(true);
      setError('');
    });

    fetch(`/api/admin/communities/${communityId}/approvals?status=${status}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load approval requests');
        return json.requests as ApprovalRequest[];
      })
      .then(setRequests)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load approval requests'))
      .finally(() => setLoading(false));
  }, [communityId, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id: string, nextStatus: 'approved' | 'rejected') {
    setActingId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/approvals/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update request');
        return;
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelected(null);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="chakra-scope">
    <Card.Root>
      <Card.Body className="flex flex-col gap-4">
        <Select value={status} onValueChange={(value) => setStatus(value as ApprovalStatus)}>
          <SelectTrigger size="lg" className="w-fit">
            <SelectValue>{(value: ApprovalStatus) => value.charAt(0).toUpperCase() + value.slice(1)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No {status} requests.
                </TableCell>
              </TableRow>
            )}
            {requests.map((request) => (
              <TableRow
                key={request._id}
                className="cursor-pointer"
                onClick={() => setSelected(request)}
              >
                <TableCell>
                  <Badge variant="outline">{request.entityType}</Badge>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {request.entityType === 'new_family' ? (
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {familyMembers(request).map((m) => (
                        <Badge key={m.key} variant={m.isHead ? 'default' : 'outline'} className="font-normal">
                          {m.name}
                          {m.relationText ? ` · ${m.relationText}` : ''}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{requesterName(request)}</TableCell>
                <TableCell>
                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card.Body>
    </Card.Root>

    <RequestDetailsDialog
      request={selected}
      open={selected !== null}
      onOpenChange={(open) => !open && setSelected(null)}
      onReview={handleReview}
      acting={actingId === selected?._id}
    />
    </div>
  );
}
