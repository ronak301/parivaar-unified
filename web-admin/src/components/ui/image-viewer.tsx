'use client';

import { useRef } from 'react';
import { CloseButton, Dialog, Portal } from '@chakra-ui/react';

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
  const scopeRef = useRef<HTMLDivElement>(null);

  if (!src) return null;

  return (
    <div className="chakra-scope" ref={scopeRef}>
      <Dialog.Root
        lazyMount
        open={open}
        onOpenChange={(e) => onOpenChange(e.open)}
      >
        <Portal container={scopeRef}>
          <Dialog.Backdrop bg="blackAlpha.850" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="transparent"
              boxShadow="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="4"
              maxW="none"
              w="auto"
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top="4"
                  right="4"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
              </Dialog.CloseTrigger>
              <img
                src={src}
                alt={alt ?? ''}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  );
}
