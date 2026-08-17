import { useState, useCallback } from 'react';

export function useImageViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState('');

  const open = useCallback((url: string, altText?: string) => {
    setImageUrl(url);
    setAlt(altText ?? '');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setImageUrl(null);
    setAlt('');
  }, []);

  return { isOpen, imageUrl, alt, open, close };
}
