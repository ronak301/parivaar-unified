import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { firebaseStorage } from "./client";

export async function uploadImage(
  file: Blob,
  path: string
): Promise<string> {
  const compressed = await imageCompression(file as File, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
  const imageRef = ref(firebaseStorage, path);
  await uploadBytes(imageRef, compressed);
  return getDownloadURL(imageRef);
}
