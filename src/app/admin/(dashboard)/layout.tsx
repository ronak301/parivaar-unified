"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Communities", icon: LayoutGrid },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-black"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/10 bg-neutral-950">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-white text-black text-sm font-bold">
            P
          </div>
          <span className="text-base font-semibold text-white tracking-tight">
            Parivaar
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Management
          </p>
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              {...item}
              active={
                item.href === "/admin"
                  ? pathname === "/admin" ||
                    pathname.startsWith("/admin/communities")
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href="/admin/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4 shrink-0" />
            Logout
          </Link>
          <p className="mt-2 px-3 text-[11px] text-white/30">Parivaar Admin v1.0</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-6">
          <Users className="size-4 text-primary" />
          <span className="text-sm font-medium">Admin Panel</span>
        </header>
        <main className="flex-1 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
