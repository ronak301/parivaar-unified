'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Settings, LogOut, Globe, ChevronDown, Menu, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user?.communities?.length) return;

    const saved = localStorage.getItem('selectedCommunityId');
    const communityExists = user.communities.some(c => c._id === saved);
    const id = (saved && communityExists) ? saved : user.communities[0]._id;

    if (!localStorage.getItem('selectedCommunityId')) {
      localStorage.setItem('selectedCommunityId', id);
    }
  }, [user?.communities]);

  const handleCommunityChange = (communityId: string) => {
    localStorage.setItem('selectedCommunityId', communityId);
    setIsDropdownOpen(false);

    if (pathname.includes('/members')) {
      router.push(`/admin/community/${communityId}/members`);
    } else if (pathname.startsWith('/admin/communities/')) {
      router.push(`/admin/communities/${communityId}`);
    } else {
      router.push(`/admin/communities/${communityId}`);
    }
  };

  const communities = user?.communities ?? [];
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  const selectedCommunity = communities.find(c => c._id === saved) || communities?.[0];
  const communityName = selectedCommunity?.name || (communities.length > 0 ? communities[0].name : 'Select');

  async function handleLogout() {
    localStorage.removeItem('auth_token');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'AU';

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-m-line bg-m-surface/85 px-3 backdrop-blur-md md:left-[260px] md:h-16 md:px-6">
      {/* Left: Hamburger + Community selector */}
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-m-ink-2 hover:bg-m-surface-2 md:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        )}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-m-field border border-m-line-strong bg-m-surface px-2.5 py-1.5 outline-none transition-colors hover:bg-m-surface-2 md:gap-2 md:px-3">
            <Globe className="hidden size-[18px] text-m-brand sm:block" />
            <span className="max-w-[10rem] truncate text-sm font-semibold text-m-ink sm:max-w-[20rem] md:max-w-[28rem]">{communityName}</span>
            <ChevronDown className={`size-4 text-m-ink-2 transition-transform md:size-[18px] ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 min-w-56 overflow-y-auto">
            {communities.map(community => (
              <DropdownMenuItem
                key={community._id}
                onClick={() => handleCommunityChange(community._id)}
                className={community._id === saved ? 'bg-m-brand/10 font-semibold text-m-brand' : ''}
              >
                {community.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Bell, divider, user */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/admin/notifications">
          <button className="relative rounded-full p-2 text-m-ink-2 transition-colors hover:bg-m-surface-2 hover:text-m-ink">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -right-1 -top-1 size-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
        </Link>

        <div className="hidden h-8 w-px bg-m-line-strong sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 pl-1 outline-none md:pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-m-ink">{user?.fullName}</div>
              <div className="text-xs capitalize text-m-ink-2">{user?.role.replace('_', ' ')}</div>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profilePicture} alt={user?.fullName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/admin/settings" className="flex items-center gap-2 w-full">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/m/login" className="flex items-center gap-2 w-full">
                <UserRound className="size-4" />
                <span>Member Login</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
