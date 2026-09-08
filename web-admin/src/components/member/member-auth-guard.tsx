'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMemberAuth } from '@/context/member-auth-context';
import { BottomTabBar } from './bottom-tab-bar';
import { Skeleton, MemberListSkeleton } from './skeleton';

/** App-shell placeholder shown while the session is being resolved. */
function ShellSkeleton() {
  return (
    <div className="pb-16">
      <div className="px-4 pb-3 pt-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-6 w-1/2" />
        <Skeleton className="mt-4 h-10 rounded-xl" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>
      </div>
      <div className="p-4">
        <MemberListSkeleton />
      </div>
      <BottomTabBar />
    </div>
  );
}

export function MemberAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useMemberAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && error) {
      router.replace('/m/login');
    }
  }, [loading, user, error, router]);

  if (loading) return <ShellSkeleton />;
  if (!user) return null;

  return <>{children}</>;
}
