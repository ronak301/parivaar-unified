'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { TopBar } from '@/components/admin/top-bar';
import { AuthProvider, useAuth } from '@/context/auth-context';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { loading, user, error } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
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
