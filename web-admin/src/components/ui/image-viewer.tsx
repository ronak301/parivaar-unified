'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

export function ImageViewer({
  open,
  onOpenChange,
  src,
  alt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  alt?: string;
}) {
  if (!src) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              />
            }
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <img
            src={src}
            alt={alt ?? ''}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl duration-200 data-open:animate-in data-open:zoom-in-95 data-open:fade-in-0 data-closed:animate-out data-closed:zoom-out-95 data-closed:fade-out-0"
            onClick={(e) => e.stopPropagation()}
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
