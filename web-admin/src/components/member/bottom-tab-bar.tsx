'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User } from 'lucide-react';

const TABS = [
  { href: '/m', label: 'Home', icon: Home },
  { href: '/m/business', label: 'Business', icon: Briefcase },
  { href: '/m/profile', label: 'Profile', icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md bg-m-surface shadow-m-bar">
      <div className="flex items-stretch justify-around border-t border-m-line">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/m'
              ? pathname === '/m' || pathname.startsWith('/m/member') || pathname.startsWith('/m/community')
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? 'text-m-brand' : 'text-m-ink-2'
              }`}
            >
              <Icon className={active ? 'size-6' : 'size-5'} strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
