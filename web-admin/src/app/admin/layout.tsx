'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { TopBar } from '@/components/admin/top-bar';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { routeCommunityId as getRouteCommunityId } from '@/lib/current-community';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { loading, user, error } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Community admins stay inside their own community: links to another
  // community (or super-admin pages) bounce back to their members list.
  const ownIds = useMemo(() => user?.communities?.map((c) => c._id) ?? [], [user?.communities]);
  const routeCommunityId = getRouteCommunityId(pathname);
  const outOfScope =
    !!user &&
    user.role !== 'super_admin' &&
    ownIds.length > 0 &&
    ((!!routeCommunityId && !ownIds.includes(routeCommunityId)) || pathname.startsWith('/admin/settings'));

  // Keep the remembered community in sync with the one being viewed, so pages
  // without an id in the URL (e.g. Generate OTP) use the same community.
  useEffect(() => {
    if (routeCommunityId && ownIds.includes(routeCommunityId)) {
      localStorage.setItem('selectedCommunityId', routeCommunityId);
    }
  }, [routeCommunityId, ownIds]);

  useEffect(() => {
    if (!outOfScope) return;
    localStorage.setItem('selectedCommunityId', ownIds[0]);
    router.replace(`/admin/community/${ownIds[0]}/members`);
  }, [outOfScope, ownIds, router]);

  if (loading || outOfScope) {
    return (
      <div className="member-app flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-m-brand/15 border-t-m-brand" />
          <p className="text-sm text-m-ink-2">Loading communities…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-app flex min-h-screen items-center justify-center bg-white">
        <div className="m-card max-w-sm p-6 text-center">
          <p className="mb-1 font-semibold text-m-ink">Couldn&apos;t load your communities</p>
          <p className="text-sm text-m-ink-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-m-field bg-m-brand px-4 py-2 text-sm font-semibold text-m-on-brand"
          >
            Try again
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="mt-3 block w-full text-sm text-m-ink-2 hover:underline"
          >
            Having trouble? Clear local storage
          </button>
        </div>
      </div>
    );
  }

  if (!user?.communities?.length) {
    return (
      <div className="member-app flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-m-ink-2">No communities available</p>
      </div>
    );
  }

  return (
    <div className="member-app flex min-h-screen bg-white text-m-ink">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col md:pl-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-3 pb-6 pt-18 md:px-6 md:pt-22">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
}
