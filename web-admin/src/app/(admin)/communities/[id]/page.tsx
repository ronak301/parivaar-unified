import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/auth/admin-client';
import { getCommunity } from '@/lib/api/community';
import { CommunityDetailView } from '@/components/admin/community-detail-view';

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

  return <CommunityDetailView community={community} />;
}
