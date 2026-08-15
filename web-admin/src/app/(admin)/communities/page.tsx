import { getAdminClient } from '@/lib/auth/admin-client';
import { getCommunities } from '@/lib/api/community';
import { CommunitiesListView } from '@/components/admin/communities-list-view';

export default async function CommunitiesPage() {
  let communities: Awaited<ReturnType<typeof getCommunities>> = [];
  let error = '';

  try {
    const client = await getAdminClient();
    communities = await getCommunities(client);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load communities';
  }

  return <CommunitiesListView initialCommunities={communities} error={error} />;
}
