'use client';

import { AppSidebar } from '@/components/admin/app-sidebar';
import { TopBar } from '@/components/admin/top-bar';
import { AuthProvider, useAuth } from '@/context/auth-context';

function AdminContent({ children }: { children: React.ReactNode }) {
  const { loading, user, error } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#dce9ff] border-t-[#3230c4]" />
          <p className="text-[#464555]">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading communities</p>
          <p className="text-[#464555] text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#0b1c30] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user?.communities?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="text-center">
          <p className="text-[#464555]">No communities available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-col flex-1 pl-[260px]">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-20 px-6 pb-6">
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
