import { useState, useCallback } from 'react';

interface UseFirebaseUploadOptions {
  folderPath: string; // e.g., "temp/families/{familyId}"
  onError?: (error: string) => void;
}

export function useFirebaseUpload({ folderPath, onError }: UseFirebaseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<Map<string, string>>(new Map());

  const uploadFile = useCallback(
    async (file: File, uploadFn: (file: File, path: string) => Promise<string>) => {
      const key = `${file.name}-${Date.now()}`;
      setUploading(true);
      try {
        const url = await uploadFn(file, key);
        setUploadedUrls((prev) => new Map(prev).set(key, url));
        return { key, url };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        onError?.(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [onError],
  );

  const getUrl = useCallback((key: string) => {
    return uploadedUrls.get(key);
  }, [uploadedUrls]);

  const clearUploads = useCallback(() => {
    setUploadedUrls(new Map());
  }, []);

  return {
    uploading,
    uploadFile,
    getUrl,
    uploadedUrls,
    clearUploads,
  };
}
