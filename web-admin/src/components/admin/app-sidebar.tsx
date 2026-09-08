'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Users, LogOut, Building2, KeyRound, type LucideIcon } from 'lucide-react';

interface NavItem {
  href: (communityId: string) => string;
  label: string;
  hint: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: (id) => `/admin/community/${id}/members`,
    label: 'Members',
    hint: 'Directory, families, export',
    icon: Users,
    isActive: (p) => p.includes('/members'),
  },
  {
    href: (id) => `/admin/communities/${id}`,
    label: 'Community',
    hint: 'Details, executives, approvals',
    icon: Building2,
    isActive: (p) => p.startsWith('/admin/communities/'),
  },
  {
    href: () => '/admin/otp',
    label: 'Generate OTP',
    hint: 'Manual OTP for users',
    icon: KeyRound,
    isActive: (p) => p === '/admin/otp',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  const communityId = (user?.communities?.some(c => c._id === saved) ? saved : user?.communities?.[0]?._id) || null;
  const community = user?.communities?.find((c) => c._id === communityId);

  async function handleLogout() {
    localStorage.removeItem('auth_token');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-m-line bg-m-surface">
      <div className="flex h-16 items-center gap-3 border-b border-m-line px-5">
        <img src="/logo.png" alt="" className="h-8 w-auto" />
        <div className="min-w-0 leading-tight">
          <p className="text-base font-bold tracking-tight text-m-ink">Parivaar</p>
          <p className="text-[11px] text-m-ink-2">Admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, hint, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={label}
              href={communityId ? href(communityId) : '#'}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-m-field px-3 py-2.5 transition-colors ${
                active ? 'bg-m-brand/10 text-m-brand' : 'text-m-ink-2 hover:bg-m-surface-2 hover:text-m-ink'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-m-brand text-m-on-brand' : 'bg-m-surface-2 text-m-ink-2 group-hover:text-m-ink'
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className={`block text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                <span className="block truncate text-[11px] text-m-ink-3">{hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-m-line p-3">
        {community && (
          <div className="mb-2 rounded-xl bg-m-surface-2/70 px-3 py-2.5">
            <p className="text-[11px] text-m-ink-2">Managing</p>
            <p className="truncate text-xs font-semibold text-m-ink" title={community.name}>
              {community.name}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-m-field px-3 py-2.5 text-left text-sm text-m-ink-2 transition-colors hover:bg-m-surface-2 hover:text-m-ink"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-m-surface-2">
            <LogOut className="size-4" />
          </span>
          Log out
        </button>
      </div>
    </aside>
  );
}
