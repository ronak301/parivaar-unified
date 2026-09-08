import { getAppConfig } from '@/config/app-config';

const CACHE_KEY = 'communities_cache';

interface CachedData<T = unknown> {
  // Kept named `communities` for backward compatibility, but now holds the full
  // auth user (role + communities) so the fast path replays the REAL identity
  // — never a hardcoded super_admin.
  communities: T;
  timestamp: number;
}

export function getCachedAuthUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData<T> = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    const ttl = getAppConfig().cache.communities.ttl;

    if (age > ttl) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    const val = data.communities;
    // Reject stale cache entries from the old format (was an array of
    // communities, now a full AuthUser object with role+communities).
    if (!val || typeof val !== 'object' || Array.isArray(val)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return val;
  } catch {
    return null;
  }
}

export function setCachedAuthUser<T = unknown>(user: T): void {
  if (typeof window === 'undefined') return;

  try {
    const data: CachedData<T> = { communities: user, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function invalidateCommunityCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
