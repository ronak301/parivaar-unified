export type ImageFieldKey =
  | 'communityLogo'
  | 'profilePhoto'
  | 'businessLogo'
  | 'businessPhoto'
  | 'designationPhoto'
  | 'default';

export interface ImageFieldConfig {
  maxSizeMB: number;
  compressTargetMB: number;
  maxWidthOrHeight: number;
  cropShape: 'round' | 'rect';
  cropAspect: number | undefined;
}

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const IMAGE_FIELD_CONFIGS: Record<ImageFieldKey, ImageFieldConfig> = {
  communityLogo: {
    maxSizeMB: 1,
    compressTargetMB: 0.9,
    maxWidthOrHeight: 1024,
    cropShape: 'rect',
    cropAspect: 1,
  },
  profilePhoto: {
    maxSizeMB: 2,
    compressTargetMB: 1.8,
    maxWidthOrHeight: 1024,
    cropShape: 'round',
    cropAspect: 1,
  },
  businessLogo: {
    maxSizeMB: 1,
    compressTargetMB: 0.9,
    maxWidthOrHeight: 1024,
    cropShape: 'rect',
    cropAspect: 1,
  },
  businessPhoto: {
    maxSizeMB: 2,
    compressTargetMB: 1.8,
    maxWidthOrHeight: 2048,
    cropShape: 'rect',
    cropAspect: undefined,
  },
  designationPhoto: {
    maxSizeMB: 2,
    compressTargetMB: 1.8,
    maxWidthOrHeight: 1024,
    cropShape: 'round',
    cropAspect: 1,
  },
  default: {
    maxSizeMB: 2,
    compressTargetMB: 1.8,
    maxWidthOrHeight: 1024,
    cropShape: 'rect',
    cropAspect: undefined,
  },
};

export function getImageConfig(key: ImageFieldKey): ImageFieldConfig {
  return IMAGE_FIELD_CONFIGS[key];
}
