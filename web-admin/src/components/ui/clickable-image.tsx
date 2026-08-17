'use client';

import type { ReactNode } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useImageViewer } from '@/hooks/use-image-viewer';
import { cn } from '@/lib/utils';

export function ClickableAvatar({
  src,
  alt,
  fallback,
  size,
  className,
}: {
  src?: string;
  alt?: string;
  fallback: ReactNode;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) {
  const viewer = useImageViewer();

  function handleClick(e: React.MouseEvent) {
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    viewer.open(src, alt);
  }

  return (
    <>
      <Avatar
        size={size}
        className={cn(src && 'cursor-pointer', className)}
        onClick={handleClick}
      >
        <AvatarImage src={src} alt={alt ?? ''} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <ImageViewer
        open={viewer.isOpen}
        onOpenChange={(open) => !open && viewer.close()}
        src={viewer.imageUrl}
        alt={viewer.alt}
      />
    </>
  );
}

export function ClickableImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const viewer = useImageViewer();

  function handleClick(e: React.MouseEvent) {
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    viewer.open(src, alt);
  }

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt ?? ''}
        className={cn('cursor-pointer', className)}
        onClick={handleClick}
      />
      <ImageViewer
        open={viewer.isOpen}
        onOpenChange={(open) => !open && viewer.close()}
        src={viewer.imageUrl}
        alt={viewer.alt}
      />
    </>
  );
}
