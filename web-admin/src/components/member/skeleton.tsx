/** Shimmering placeholder blocks used while member-app data loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-m-surface-2 ${className}`} />;
}

export function MemberListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading members">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="m-card flex items-center gap-3 p-3.5">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function BusinessListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading businesses">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="m-card flex items-center gap-4 p-4">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-m-line" role="status" aria-label="Loading details">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3.5">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Header banner + floating card placeholder, mirrors ProfileHeaderCard layout. */
export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile">
      <div className="relative z-10 -mt-12 px-4">
        <div className="m-card-float p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-[72px] shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-6 pt-4">
        <Skeleton className="h-10 rounded-xl" />
        <div className="mt-2">
          <DetailRowsSkeleton />
        </div>
      </div>
    </div>
  );
}
