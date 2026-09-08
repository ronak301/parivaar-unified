'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCachedAuthUser, setCachedAuthUser, invalidateCommunityCache } from '@/lib/cache/communities-cache';

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
      // Fast path: replay the last real user (role + communities) from cache.
      if (!bypassCache) {
        const cachedUser = getCachedAuthUser<AuthUser>();
        if (cachedUser) {
          setState({ user: cachedUser, loading: false, error: null });
          return;
        }
      }

      // Cache miss or bypass - fetch the real identity from the API.
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }
      const data = await res.json();

      if (data.user) {
        setCachedAuthUser(data.user);
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
    fetchUser(); // eslint-disable-line react-hooks/set-state-in-effect
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
