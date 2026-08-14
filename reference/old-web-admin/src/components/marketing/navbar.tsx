"use client";

import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#benefits", label: "Benefits" },
  { href: "#about", label: "About Us" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/marketing/logo.png" alt="Parivaar" width={32} height={32} />
          <span className="text-xl font-semibold">Parivaar</span>
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/admin/login"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
