'use client';

import { useEffect, useRef, useState } from 'react';

const CACHE = new Map<string, unknown>();

export function useCachedFetch<T>(
  key: string | null,
  fetcher: () => Promise<T>,
): { data: T | null; loading: boolean } {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [state, setState] = useState<{ data: T | null; loading: boolean }>(() => {
    if (!key) return { data: null, loading: false };
    const cached = CACHE.get(key) as T | undefined;
    return cached !== undefined
      ? { data: cached, loading: false }
      : { data: null, loading: true };
  });

  useEffect(() => {
    if (!key) {
      setState({ data: null, loading: false });
      return;
    }

    const cached = CACHE.get(key) as T | undefined;
    if (cached !== undefined) {
      setState({ data: cached, loading: false });
    } else {
      setState((prev) => ({ ...prev, loading: true }));
    }

    let cancelled = false;
    fetcherRef.current()
      .then((result) => {
        if (!cancelled) {
          CACHE.set(key, result);
          setState({ data: result, loading: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
