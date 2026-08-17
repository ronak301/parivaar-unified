'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCachedCommunities, setCachedCommunities, invalidateCommunityCache } from '@/lib/cache/communities-cache';

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'super_admin' | 'community_admin' | 'member';
  profilePicture?: string;
  communities?: Array<{ _id: string; name: string }>;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthContextValue, 'refetch'>>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async (bypassCache = false) => {
    try {
      // Check cache first (unless bypassed)
      if (!bypassCache) {
        const cachedCommunities = getCachedCommunities();
        if (cachedCommunities) {
          setState({
            user: {
              _id: 'dev-admin-id',
              firstName: 'Admin',
              lastName: 'User',
              fullName: 'Admin User',
              role: 'super_admin',
              profilePicture: undefined,
              communities: cachedCommunities,
            },
            loading: false,
            error: null,
          });
          return;
        }
      }

      // Cache miss or bypass - fetch from API
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }
      const data = await res.json();

      // Cache the communities
      if (data.user?.communities) {
        setCachedCommunities(data.user.communities);
      }

      setState({ user: data.user, loading: false, error: null });
    } catch (err) {
      console.error('Auth error:', err);
      setState({
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  const refetch = useCallback(() => {
    invalidateCommunityCache();
    fetchUser(true);
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const contextValue: AuthContextValue = {
    ...state,
    refetch,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
