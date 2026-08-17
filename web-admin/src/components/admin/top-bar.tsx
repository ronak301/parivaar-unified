'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, Settings, LogOut, Globe, ChevronDown } from 'lucide-react';
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

export function TopBar() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // TODO: Implement notifications endpoint
  // useEffect(() => {
  //   async function fetchUnreadCount() {
  //     try {
  //       const res = await fetch(
  //         `/api/admin/notifications?limit=1&isRead=false`,
  //         {
  //           headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
  //         }
  //       );
  //       if (res.ok) {
  //         const data = await res.json();
  //         setUnreadCount(data.unreadCount ?? 0);
  //       }
  //     } catch {
  //       // silently fail
  //     }
  //   }

  //   fetchUnreadCount();
  //   const interval = setInterval(fetchUnreadCount, 30000);
  //   return () => clearInterval(interval);
  // }, []);

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
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-white/90 backdrop-blur-md border-b border-[#c7c4d7] z-40 flex items-center justify-between px-6">
      {/* Left: Community selector */}
      <div className="relative" onMouseLeave={() => setIsDropdownOpen(false)}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#e5eeff] hover:bg-[#dce9ff] rounded-lg border border-[#c7c4d7] transition-colors"
        >
          <Globe className="size-[18px] text-[#3230c4]" />
          <span className="font-body-md text-sm font-semibold text-[#0b1c30]">{communityName}</span>
          <ChevronDown className={`size-[18px] text-[#3230c4] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#c7c4d7] rounded-lg shadow-md z-20 min-w-48 max-h-48 overflow-y-auto">
            {communities.map(community => (
              <button
                key={community._id}
                onClick={() => handleCommunityChange(community._id)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  community._id === saved
                    ? 'bg-[#e5eeff] text-[#0b1c30] font-semibold'
                    : 'text-[#464555] hover:bg-[#f8f9ff]'
                }`}
              >
                {community.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Bell, divider, user */}
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications">
          <button className="p-2 text-[#464555] hover:bg-[#e5eeff] rounded-full transition-colors relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -right-1 -top-1 size-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
        </Link>

        <div className="h-8 w-[1px] bg-[#c7c4d7]" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 pl-2 outline-none">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-[#0b1c30]">{user?.fullName}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#464555]">{user?.role.replace('_', ' ')}</div>
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
