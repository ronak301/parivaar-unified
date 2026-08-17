'use client';

import { useRef, type ReactNode } from 'react';
import type { ImageFieldKey } from '@parivaar/shared';
import { ALLOWED_IMAGE_TYPES } from '@parivaar/shared';
import { useImageUpload } from '@/hooks/use-image-upload';
import { ImageCropModal } from '@/components/ui/image-crop-modal';

export function ImageUploadField({
  fieldKey,
  onFileReady,
  onError,
  children,
}: {
  fieldKey: ImageFieldKey;
  onFileReady: (file: File) => void;
  onError?: (error: string) => void;
  children?: (props: { openFilePicker: () => void; openWithFile: (file: File) => void; isProcessing: boolean }) => ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useImageUpload({ fieldKey, onComplete: onFileReady, onError });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) upload.openWithFile(file);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />
      {children?.({ openFilePicker, openWithFile: upload.openWithFile, isProcessing: upload.isProcessing })}
      <ImageCropModal
        open={upload.cropModalOpen}
        onOpenChange={() => {}}
        imageSrc={upload.imageSrc}
        cropShape={upload.cropShape}
        aspect={upload.cropAspect}
        isProcessing={upload.isProcessing}
        onCropComplete={upload.handleCropComplete}
        onCancel={upload.cancel}
      />
    </>
  );
}

export type { ImageFieldKey };
