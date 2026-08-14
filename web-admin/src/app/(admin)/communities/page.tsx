import Link from 'next/link';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getCommunities } from '@/lib/api/community';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export default async function CommunitiesPage() {
  let communities: Awaited<ReturnType<typeof getCommunities>> = [];
  let error = '';

  try {
    const client = await getAdminClient();
    communities = await getCommunities(client);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load communities';
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Communities</h1>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {communities.length === 0 && !error && (
        <p className="text-muted-foreground">No communities found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <Link key={community._id} href={`/communities/${community._id}`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{community.name}</CardTitle>
                  {community.city && community.state && (
                    <CardDescription>
                      {community.city}, {community.state}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {community.status && (
                  <Badge variant="secondary">{community.status}</Badge>
                )}
                {community.type && (
                  <Badge variant="outline">{community.type}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
