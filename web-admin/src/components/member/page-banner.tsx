'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron on the left that calls router.back(). */
  showBack?: boolean;
  /** Optional right-side action, e.g. a settings button. */
  action?: React.ReactNode;
  /** Extra bottom padding so a card can float over the banner. */
  tall?: boolean;
  /** Compact single-row header (sub-pages like Filters / Edit Profile). */
  compact?: boolean;
}

/** Gradient page header shared by every member-app screen. Look comes from `.m-banner` in theme.css. */
export function PageBanner({ title, subtitle, showBack, action, tall = true, compact = false }: PageBannerProps) {
  const router = useRouter();
  return (
    <div
      className={`m-banner relative overflow-hidden px-4 ${
        compact ? 'py-3' : tall ? 'pb-16 pt-5' : 'pb-5 pt-5'
      }`}
    >
      {!compact && (
        <>
          <div className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-32 rounded-full bg-white/10" />
        </>
      )}
      <div className={`relative flex justify-between ${compact ? 'items-center' : 'items-start'}`}>
        <div className={`flex gap-1 ${compact ? 'items-center gap-2' : 'items-start'}`}>
          {showBack && (
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className={`-ml-2 rounded-full p-1 transition-colors hover:bg-white/15 ${compact ? '' : 'mt-0.5'}`}
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <div>
            <h1 className={`font-bold leading-tight ${compact ? 'text-base' : 'text-lg'}`}>{title}</h1>
            {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
