import imageCompression from 'browser-image-compression';
import type { ImageFieldConfig } from '@parivaar/shared';
import { ALLOWED_IMAGE_TYPES } from '@parivaar/shared';

const PRE_CROP_MAX_MB = 20;

export async function compressImage(
  file: File,
  targetSizeMB: number,
  maxWidthOrHeight: number,
): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  });
  return new File([compressed], file.name, { type: compressed.type });
}

export function validateImageFile(
  file: File,
  config: ImageFieldConfig,
): { valid: boolean; error?: string } {
  const allowed = ALLOWED_IMAGE_TYPES as readonly string[];
  if (!allowed.includes(file.type)) {
    return { valid: false, error: 'Image must be PNG, JPEG, or WebP' };
  }
  if (file.size > PRE_CROP_MAX_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${PRE_CROP_MAX_MB}MB` };
  }
  return { valid: true };
}
