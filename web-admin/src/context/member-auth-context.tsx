'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@parivaar/shared';

interface MemberAuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<Omit<MemberAuthContextValue, 'refetch' | 'logout'>>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/member/auth/me');
      if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }
      const data = await res.json();
      setState({ user: data.user, loading: false, error: null });
    } catch (err) {
      setState({
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/member/auth/logout', { method: 'POST' });
    setState({ user: null, loading: false, error: null });
    router.push('/m/login');
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const contextValue: MemberAuthContextValue = {
    ...state,
    refetch: fetchUser,
    logout,
  };

  return <MemberAuthContext.Provider value={contextValue}>{children}</MemberAuthContext.Provider>;
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider');
  }
  return context;
}
