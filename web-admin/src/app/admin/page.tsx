'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Building2, ChevronRight, Users } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.communities?.length) return;
    if (user.communities.length === 1) {
      const id = user.communities[0]._id;
      localStorage.setItem('selectedCommunityId', id);
      router.push(`/admin/community/${id}/members`);
    }
  }, [user, router]);

  if (!user?.communities?.length || user.communities.length === 1) return null;

  function handlePick(communityId: string) {
    localStorage.setItem('selectedCommunityId', communityId);
    router.push(`/admin/community/${communityId}/members`);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-m-brand/10 text-m-brand">
            <Building2 className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-m-ink">Choose a community</h1>
          <p className="mt-1 text-sm text-m-ink-2">
            You manage {user.communities.length} communities. Pick one to get started.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {user.communities.map((c) => (
            <button
              key={c._id}
              onClick={() => handlePick(c._id)}
              className="m-card group flex items-center gap-4 p-4 text-left transition-shadow hover:shadow-m-float"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-m-tone-indigo-bg text-m-tone-indigo-fg">
                <Users className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-m-ink">{c.name}</p>
              </div>
              <ChevronRight className="size-5 text-m-ink-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
