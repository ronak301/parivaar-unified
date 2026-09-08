'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApprovalRequest } from '@parivaar/shared';

interface State {
  request: ApprovalRequest | null;
  loading: boolean;
  /** Timestamp of the last fetch; lets consumers do age math without Date.now() in render. */
  fetchedAt: number;
}

/** Latest profile-edit approval request for the logged-in member. */
export function useProfileEditStatus(enabled = true) {
  const [state, setState] = useState<State>({ request: null, loading: enabled, fetchedAt: 0 });

  const refetch = useCallback(() => {
    if (!enabled) return;
    fetch('/api/member/profile-edit')
      .then((r) => r.json())
      .then((d) => setState({ request: d.request ?? null, loading: false, fetchedAt: Date.now() }))
      .catch(() => setState({ request: null, loading: false, fetchedAt: Date.now() }));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
