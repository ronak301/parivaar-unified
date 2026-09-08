'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useMemberAuth } from '@/context/member-auth-context';
import { useProfileEditStatus } from '@/lib/member/use-profile-edit-status';
import { EditProfileForm } from '@/components/member/edit-profile-form';
import { OtpGate } from '@/components/member/otp-gate';
import { PageBanner } from '@/components/member/page-banner';
import { ProfileEditStatusBanner } from '@/components/member/profile-edit-status-banner';
import { Skeleton } from '@/components/member/skeleton';
import { Button } from '@/components/ui/button';

export default function MemberEditProfilePage() {
  const router = useRouter();
  const { user } = useMemberAuth();
  const { request, loading, fetchedAt } = useProfileEditStatus(!!user);
  const [actionToken, setActionToken] = useState<string | null>(null);

  if (!user) return null;

  const hasPending = request?.status === 'pending';

  return (
    <div>
      <PageBanner title="Edit Profile" subtitle="Changes are reviewed by your community admin" showBack tall={false} />

      {loading ? (
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      ) : hasPending ? (
        <div>
          <ProfileEditStatusBanner request={request} now={fetchedAt} />
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="size-7" />
            </div>
            <p className="text-sm font-semibold">Your previous changes are still under review</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              You can submit new edits once the community admin approves or rejects them.
            </p>
            <Button variant="outline" className="mt-2" onClick={() => router.push('/m/profile')}>
              Back to profile
            </Button>
          </div>
        </div>
      ) : !actionToken ? (
        <OtpGate purpose="profile_edit" onVerified={setActionToken} onCancel={() => router.back()} />
      ) : (
        <>
          {request?.status === 'rejected' && <ProfileEditStatusBanner request={request} now={fetchedAt} />}
          <EditProfileForm user={user} actionToken={actionToken} />
        </>
      )}
    </div>
  );
}
