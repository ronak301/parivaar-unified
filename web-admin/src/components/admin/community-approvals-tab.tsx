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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_FILTERS: ApprovalStatus[] = ['pending', 'approved', 'rejected'];

function requesterName(request: ApprovalRequest): string {
  const requestedBy = request.requestedBy as unknown;
  if (requestedBy && typeof requestedBy === 'object') {
    const r = requestedBy as { fullName?: string; firstName?: string; lastName?: string };
    return r.fullName ?? ([r.firstName, r.lastName].filter(Boolean).join(' ') || '-');
  }
  return '-';
}

export function CommunityApprovalsTab({ communityId }: { communityId: string }) {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Select value={status} onValueChange={(value) => setStatus(value as ApprovalStatus)}>
          <SelectTrigger size="lg" className="w-fit">
            <SelectValue />
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
              <TableHead>Requested By</TableHead>
              <TableHead>Created</TableHead>
              {status === 'pending' && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No {status} requests.
                </TableCell>
              </TableRow>
            )}
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <Badge variant="outline">{request.entityType}</Badge>
                </TableCell>
                <TableCell>{requesterName(request)}</TableCell>
                <TableCell>
                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                </TableCell>
                {status === 'pending' && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actingId === request._id}
                        onClick={() => handleReview(request._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actingId === request._id}
                        onClick={() => handleReview(request._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
