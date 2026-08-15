'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import { CreateCommunityDialog } from '@/components/admin/create-community-dialog';

function statusVariant(status?: string): 'secondary' | 'outline' {
  return status === 'Active' ? 'secondary' : 'outline';
}

export function CommunitiesListView({
  initialCommunities,
  error,
}: {
  initialCommunities: Community[];
  error?: string;
}) {
  const [communities, setCommunities] = useState(initialCommunities);

  function handleCreated(community: Community) {
    setCommunities((prev) => [community, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-sm text-muted-foreground">
            {communities.length} {communities.length === 1 ? 'community' : 'communities'}
          </p>
        </div>
        <CreateCommunityDialog onCreated={handleCreated} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {communities.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Building2 className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No communities found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl ring-1 ring-foreground/6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community) => (
                <TableRow key={community._id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link
                      href={`/admin/communities/${community._id}`}
                      className="flex items-center gap-3 px-2 py-2.5"
                    >
                      <Avatar size="sm">
                        <AvatarImage src={community.logo} alt="" />
                        <AvatarFallback>
                          <Building2 className="size-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{community.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/communities/${community._id}`} className="block px-2 py-2.5">
                      {community.city && community.state
                        ? `${community.city}, ${community.state}`
                        : (community.city ?? community.state ?? '—')}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/communities/${community._id}`} className="block px-2 py-2.5">
                      {community.status ? (
                        <Badge variant={statusVariant(community.status)}>
                          {community.status}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/communities/${community._id}`}
                      className="block px-2 py-2.5 text-muted-foreground"
                    >
                      {community.createdAt
                        ? new Date(community.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
