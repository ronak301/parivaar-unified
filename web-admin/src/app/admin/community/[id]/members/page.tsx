'use client';

import { MembersDirectoryView } from '@/components/admin/members-directory-view';
import { useParams } from 'next/navigation';

export default function CommunityMembersPage() {
  const params = useParams();
  const communityId = params.id as string;
  return <MembersDirectoryView communityId={communityId} />;
}
