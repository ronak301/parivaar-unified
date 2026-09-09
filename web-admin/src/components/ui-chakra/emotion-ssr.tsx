'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

export function EmotionCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'css' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const entries = (cache as unknown as { inserted: Record<string, string> }).inserted;
    if (!entries || Object.keys(entries).length === 0) return null;

    const names = Object.keys(entries);
    const styles = names.map((n) => entries[n]).join('');

    // Clear so we don't re-insert on the next render
    for (const name of names) {
      delete entries[name];
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
