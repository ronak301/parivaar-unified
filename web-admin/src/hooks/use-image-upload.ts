import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageFieldKey, ImageFieldConfig } from '@parivaar/shared';
import { getImageConfig } from '@parivaar/shared';
import { cropImageToFile, compressImage, validateImageFile } from '@/lib/image';
import type { CropArea } from '@/lib/image';

interface UseImageUploadOptions {
  fieldKey: ImageFieldKey;
  onComplete: (file: File) => void;
  onError?: (error: string) => void;
}

export function useImageUpload({ fieldKey, onComplete, onError }: UseImageUploadOptions) {
  const config = getImageConfig(fieldKey);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  function revokeUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => revokeUrl();
  }, []);

  const openWithFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file, config);
      if (!validation.valid) {
        onError?.(validation.error!);
        return;
      }
      revokeUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setImageSrc(url);
      setCropModalOpen(true);
    },
    [config, onError],
  );

  const handleCropComplete = useCallback(
    async (croppedAreaPixels: CropArea) => {
      if (!imageSrc) return;
      setIsProcessing(true);
      try {
        const cropped = await cropImageToFile(imageSrc, croppedAreaPixels, 'cropped.jpg');
        const compressed = await compressImage(
          cropped,
          config.compressTargetMB,
          config.maxWidthOrHeight,
        );
        setCropModalOpen(false);
        revokeUrl();
        setImageSrc(null);
        onComplete(compressed);
      } catch {
        onError?.('Failed to process image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [imageSrc, config, onComplete, onError],
  );

  const cancel = useCallback(() => {
    setCropModalOpen(false);
    revokeUrl();
    setImageSrc(null);
  }, []);

  return {
    cropModalOpen,
    imageSrc,
    cropShape: config.cropShape,
    cropAspect: config.cropAspect,
    isProcessing,
    openWithFile,
    handleCropComplete,
    cancel,
    config,
  };
}
