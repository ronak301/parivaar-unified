const PREFIX = 'pv_cache_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as CacheEntry<T>).data;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full/unavailable — silently skip caching
  }
}

export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}
