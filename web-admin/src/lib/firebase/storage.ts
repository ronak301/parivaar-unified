import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { firebaseStorage } from './client';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_BYTES = 3 * 1024 * 1024;

async function uploadImage(file: File, folder: string, keyHint: string, label: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`${label} must be a PNG, JPEG, or WEBP image`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`${label} must be smaller than 3MB`);
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  });

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${keyHint}-${Date.now()}.${extension}`;
  const imageRef = ref(firebaseStorage, path);
  await uploadBytes(imageRef, compressed, { contentType: compressed.type });
  return getDownloadURL(imageRef);
}

export async function uploadCommunityLogo(file: File, communityId: string): Promise<string> {
  return uploadImage(file, 'community-logos', communityId, 'Logo');
}

export async function uploadUserPhoto(file: File, keyHint: string): Promise<string> {
  return uploadImage(file, 'user-photos', keyHint, 'Photo');
}
