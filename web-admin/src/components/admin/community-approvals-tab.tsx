'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import type { ApprovalRequest, ApprovalStatus, ProfileEditPayload } from '@parivaar/shared';
import { BloodGroups, Gender } from '@parivaar/shared';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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

const PROFILE_FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  profilePicture: 'Profile photo',
  guardianName: 'Guardian name',
  dob: 'Date of birth',
  weddingDate: 'Wedding date',
  gender: 'Gender',
  email: 'Email',
  education: 'Education',
  specialEducation: 'Special education',
  bloodGroup: 'Blood group',
  hobbies: 'Hobbies',
  achievements: 'Achievements',
  nativePlace: 'Native place',
  nativeDistrict: 'Native district',
  nanihaal: 'Nanihaal',
  aadharLast4: 'Aadhar (last 4)',
  address: 'Address',
};

function profileEditChanges(request: ApprovalRequest): { changes: Record<string, unknown>; previous: Record<string, unknown> } {
  const payload = (request.payload ?? {}) as Partial<ProfileEditPayload> & Record<string, unknown>;
  // Member-submitted requests carry {changes, previous}; older admin-made ones may be flat.
  if (payload.changes && typeof payload.changes === 'object') {
    return { changes: payload.changes, previous: payload.previous ?? {} };
  }
  return { changes: payload, previous: {} };
}

function displayProfileValue(field: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">—</span>;
  if (field === 'profilePicture' && typeof value === 'string') {
    return <img src={value} alt="" className="size-12 rounded-full object-cover ring-1 ring-border" />;
  }
  if (field === 'bloodGroup' && typeof value === 'string') return BloodGroups.find((b) => b.id === value)?.label ?? value;
  if (field === 'gender' && typeof value === 'string') return Gender.find((g) => g.id === value)?.label ?? value;
  if (typeof value === 'string') return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : value;
  if (typeof value === 'object') {
    const parts = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${String(v)}`);
    return parts.length ? parts.join(' · ') : <span className="text-muted-foreground">—</span>;
  }
  return String(value);
}

function ProfileEditDiff({ request }: { request: ApprovalRequest }) {
  const { changes, previous } = profileEditChanges(request);
  const fields = Object.keys(changes);
  if (fields.length === 0) return <p className="text-sm text-muted-foreground">No field changes in this request.</p>;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Field</th>
            <th className="px-3 py-2 text-left font-medium">Current</th>
            <th className="px-3 py-2 text-left font-medium">Requested</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {fields.map((f) => (
            <tr key={f}>
              <td className="px-3 py-2 align-top font-medium text-foreground">{PROFILE_FIELD_LABELS[f] ?? f}</td>
              <td className="px-3 py-2 align-top text-muted-foreground">{displayProfileValue(f, previous[f])}</td>
              <td className="px-3 py-2 align-top font-semibold text-emerald-700">{displayProfileValue(f, changes[f])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function summarizeProfileEdit(request: ApprovalRequest): string {
  const names = Object.keys(profileEditChanges(request).changes).map((f) => PROFILE_FIELD_LABELS[f] ?? f);
  if (names.length === 0) return '-';
  return names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
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
  remarks,
  onRemarksChange,
}: {
  request: ApprovalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: (id: string, status: 'approved' | 'rejected', remarks?: string) => void;
  acting: boolean;
  remarks: string;
  onRemarksChange: (v: string) => void;
}) {
  if (!request) return null;

  const isNewFamily = request.entityType === 'new_family';
  const isProfileEdit = request.entityType === 'profile_edit';
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
          <DialogTitle>
            {isNewFamily ? 'New Family Registration' : isProfileEdit ? 'Profile Edit Request' : request.entityType.replace(/_/g, ' ')}
          </DialogTitle>
          <DialogDescription>
            Requested by {requesterName(request)}
            {request.createdAt ? ` on ${formatDate(request.createdAt) ?? ''}` : ''}
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

          {isProfileEdit && <ProfileEditDiff request={request} />}

          {!isNewFamily && !isProfileEdit && (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {JSON.stringify(request.payload, null, 2)}
            </pre>
          )}

          {request.status !== 'pending' && request.remarks && <DetailField label="Remarks" value={request.remarks} />}
        </div>

        {request.status === 'pending' && (
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <textarea
              value={remarks}
              onChange={(e) => onRemarksChange(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Remarks for the member (optional; recommended when rejecting)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <div className="flex justify-end gap-2">
              <Button variant="destructive" disabled={acting} onClick={() => onReview(request._id, 'rejected', remarks)}>
                Reject
              </Button>
              <Button disabled={acting} onClick={() => onReview(request._id, 'approved', remarks)}>
                Approve
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CommunityApprovalsTab({
  communityId,
  onPendingCountChange,
}: {
  communityId: string;
  onPendingCountChange?: (count: number) => void;
}) {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');

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
      .then((reqs) => {
        setRequests(reqs);
        if (status === 'pending') onPendingCountChange?.(reqs.length);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load approval requests'))
      .finally(() => setLoading(false));
  }, [communityId, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id: string, nextStatus: 'approved' | 'rejected', reviewRemarks?: string) {
    setActingId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/approvals/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, remarks: reviewRemarks?.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update request');
        return;
      }
      setRequests((prev) => {
        const next = prev.filter((r) => r._id !== id);
        if (status === 'pending') onPendingCountChange?.(next.length);
        return next;
      });
      setSelected(null);
      setRemarks('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="m-card flex flex-col gap-4 p-4">
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
              <TableHead>Details</TableHead>
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
                  ) : request.entityType === 'profile_edit' ? (
                    <span className="text-sm text-muted-foreground">{summarizeProfileEdit(request)}</span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{requesterName(request)}</TableCell>
                <TableCell>
                  {formatDate(request.createdAt) ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

    <RequestDetailsDialog
      request={selected}
      open={selected !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          setRemarks('');
        }
      }}
      onReview={handleReview}
      acting={actingId === selected?._id}
      remarks={remarks}
      onRemarksChange={setRemarks}
    />
    </div>
  );
}
