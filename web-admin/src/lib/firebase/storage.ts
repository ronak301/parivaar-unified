import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import type { ImageFieldKey } from '@parivaar/shared';
import { getImageConfig, ALLOWED_IMAGE_TYPES } from '@parivaar/shared';
import { firebaseStorage } from './client';

async function uploadImage(
  file: File,
  folder: string,
  keyHint: string,
  fieldKey: ImageFieldKey,
): Promise<string> {
  const config = getImageConfig(fieldKey);
  const allowed = ALLOWED_IMAGE_TYPES as readonly string[];

  if (!allowed.includes(file.type)) {
    throw new Error('Image must be a PNG, JPEG, or WEBP file');
  }

  const maxBytes = config.maxSizeMB * 1024 * 1024;
  let finalFile = file;

  if (file.size > maxBytes) {
    finalFile = await imageCompression(file, {
      maxSizeMB: config.compressTargetMB,
      maxWidthOrHeight: config.maxWidthOrHeight,
      useWebWorker: true,
    });
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${keyHint}-${Date.now()}.${extension}`;
  const imageRef = ref(firebaseStorage, path);
  await uploadBytes(imageRef, finalFile, { contentType: finalFile.type });
  return getDownloadURL(imageRef);
}

export async function uploadCommunityLogo(file: File, communityId: string): Promise<string> {
  return uploadImage(file, 'community-logos', communityId, 'communityLogo');
}

export async function uploadUserPhoto(file: File, keyHint: string): Promise<string> {
  return uploadImage(file, 'user-photos', keyHint, 'profilePhoto');
}

export async function uploadBusinessLogo(file: File, keyHint: string): Promise<string> {
  return uploadImage(file, 'business-logos', keyHint, 'businessLogo');
}

export async function uploadBusinessPhoto(file: File, keyHint: string): Promise<string> {
  return uploadImage(file, 'business-photos', keyHint, 'businessPhoto');
}
