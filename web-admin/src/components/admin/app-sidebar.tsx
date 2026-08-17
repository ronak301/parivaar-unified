'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: 'members', label: 'Members', icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const communityId = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;

  async function handleLogout() {
    localStorage.removeItem('auth_token');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#c7c4d7] z-50 flex flex-col">
      {/* Logo section */}
      <div className="p-4 flex items-center gap-3 border-b border-[#c7c4d7]">
        <img src="/logo.png" alt="Parivaar" className="h-8 w-auto" />
        <span className="text-[18px] font-semibold text-[#3230c4] uppercase tracking-tight">Parivaar</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const href = communityId ? `/admin/community/${communityId}/${path}` : `#`;
          const isActive = pathname.includes(`/${path}`);
          return (
            <Link
              key={path}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded transition-colors ${
                isActive
                  ? 'bg-[#4c4ddc] text-[#dbdaff] font-semibold'
                  : 'text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className="size-5" />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}

        {/* Settings divider at bottom of nav */}
        <div className="pt-4 mt-4 border-t border-[#c7c4d7]">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
          >
            <Settings className="size-5" />
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors text-left"
          >
            <LogOut className="size-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
