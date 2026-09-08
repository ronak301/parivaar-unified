'use client';

import { useMemberAuth } from '@/context/member-auth-context';
import { useProfileEditStatus } from '@/lib/member/use-profile-edit-status';
import { ProfileHeaderCard } from '@/components/member/profile-header-card';
import { ProfileDetailTabs } from '@/components/member/profile-detail-tabs';
import { ProfileEditStatusBanner } from '@/components/member/profile-edit-status-banner';
import { FamilySection } from '@/components/member/family-section';

export default function MemberProfilePage() {
  const { user, logout } = useMemberAuth();
  const { request, fetchedAt } = useProfileEditStatus(!!user);

  if (!user) return null;

  return (
    <div>
      <ProfileHeaderCard user={user} onLogout={logout} pendingEdit={request?.status === 'pending'} />
      <ProfileEditStatusBanner request={request} now={fetchedAt} />
      <FamilySection user={user} selfId={user._id} communityId={user.communityIds?.[0]} />
      <ProfileDetailTabs user={user} />
      <div className="h-8" />
    </div>
  );
}
