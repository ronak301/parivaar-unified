'use client';

import { startTransition, useEffect, useState } from 'react';
import type { UserListItem } from '@parivaar/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MembersResponse {
  users: UserListItem[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export function CommunityMembersTab({
  communityId,
  refreshKey,
}: {
  communityId: string;
  refreshKey?: number;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      setLoading(true);
      setError('');
    });

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);

    fetch(`/api/admin/communities/${communityId}/members?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load members');
        return json as MembersResponse;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load members');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [communityId, search, page, refreshKey]);

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Enrollment ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead>Family Head</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.firstName} {user.lastName ?? ''}
                </TableCell>
                <TableCell>{user.enrollmentId}</TableCell>
                <TableCell>{user.phone ?? '-'}</TableCell>
                <TableCell>{user.address?.city ?? '-'}</TableCell>
                <TableCell>{user.address?.locality ?? '-'}</TableCell>
                <TableCell>
                  {user.isFamilyHead && <Badge variant="secondary">Head</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
