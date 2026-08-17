import { getAppConfig } from '@/config/app-config';

const CACHE_KEY = 'communities_cache';

interface CachedData {
  communities: any[];
  timestamp: number;
}

export function getCachedCommunities(): any[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const now = Date.now();
    const age = now - data.timestamp;
    const config = getAppConfig();
    const ttl = config.cache.communities.ttl;

    if (age > ttl) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.communities;
  } catch {
    return null;
  }
}

export function setCachedCommunities(communities: any[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data: CachedData = {
      communities,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function invalidateCommunityCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
