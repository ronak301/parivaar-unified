import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getCommunity } from '@/lib/api/community';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import { CommunityDetailTabs } from '@/components/admin/community-detail-tabs';

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await getAdminClient();
  let community;
  try {
    community = await getCommunity(client, id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/communities" />}>
          <ArrowLeft />
          Back to communities
        </Button>

        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              {community.status && <Badge variant="secondary">{community.status}</Badge>}
              {community.type && <Badge variant="outline">{community.type}</Badge>}
              {community.city && community.state && (
                <Badge variant="outline">
                  {community.city}, {community.state}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommunityDetailTabs community={community} />
    </div>
  );
}
