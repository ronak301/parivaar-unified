'use client';

import { useParams } from 'next/navigation';
import { UserX } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { PageBanner } from '@/components/member/page-banner';
import { ProfileHeaderCard } from '@/components/member/profile-header-card';
import { ProfileDetailTabs } from '@/components/member/profile-detail-tabs';
import { FamilySection } from '@/components/member/family-section';
import { ProfileSkeleton } from '@/components/member/skeleton';

interface MemberResponse {
  success: boolean;
  user: User;
}

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const { user: self } = useMemberAuth();

  const { data, loading } = useCachedFetch<MemberResponse>(
    `member:${params.id}`,
    () => fetch(`/api/member/users/${params.id}`).then((r) => r.json()),
  );

  const member = data?.user ?? null;

  if (loading) {
    return (
      <div>
        <PageBanner title="Member Profile" showBack />
        <ProfileSkeleton />
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <PageBanner title="Member Profile" showBack tall={false} />
        <div className="flex flex-col items-center gap-2 py-16">
          <UserX className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Member not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProfileHeaderCard user={member} variant="other" />
      <FamilySection user={member} selfId={self?._id} communityId={self?.communityIds?.[0]} />
      <ProfileDetailTabs user={member} />
      <div className="h-8" />
    </div>
  );
}
