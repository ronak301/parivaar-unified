'use client';

import { useCallback, useState } from 'react';

export type MaritalFilter = '' | 'married' | 'unmarried';

export interface DirectoryFilters {
  gender: string;
  bloodGroup: string;
  locality: string;
  businessCategory: string;
  marital: MaritalFilter;
  /** Inclusive age bounds in years; empty string = unset. */
  ageMin: string;
  ageMax: string;
}

export const EMPTY_DIRECTORY_FILTERS: DirectoryFilters = {
  gender: '',
  bloodGroup: '',
  locality: '',
  businessCategory: '',
  marital: '',
  ageMin: '',
  ageMax: '',
};

/** Common age brackets offered as one-tap presets. */
export const AGE_PRESETS: Array<{ label: string; min: string; max: string }> = [
  { label: 'Under 18', min: '', max: '17' },
  { label: '18–25', min: '18', max: '25' },
  { label: '26–35', min: '26', max: '35' },
  { label: '36–50', min: '36', max: '50' },
  { label: '50+', min: '51', max: '' },
];

/** Number of user-visible active filters (age range counts once). */
export function countActiveFilters(f: DirectoryFilters): number {
  let n = 0;
  if (f.gender) n++;
  if (f.bloodGroup) n++;
  if (f.locality) n++;
  if (f.businessCategory) n++;
  if (f.marital) n++;
  if (f.ageMin || f.ageMax) n++;
  return n;
}

/** Translate UI filter state into search API query params. */
export function appendFilterParams(params: URLSearchParams, f: DirectoryFilters): void {
  if (f.gender) params.set('filters[gender]', f.gender);
  if (f.bloodGroup) params.set('filters[bloodGroup]', f.bloodGroup);
  if (f.locality) params.set('filters[locality]', f.locality);
  if (f.businessCategory) params.set('filters[businessCategory]', f.businessCategory);
  if (f.marital) params.set('filters[isMarried]', f.marital === 'married' ? 'true' : 'false');
  if (f.ageMin) params.set('filters[ageMin]', f.ageMin);
  if (f.ageMax) params.set('filters[ageMax]', f.ageMax);
}

const STORAGE_KEY = 'member_directory_filters';

function readStoredFilters(): DirectoryFilters {
  if (typeof window === 'undefined') return EMPTY_DIRECTORY_FILTERS;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DIRECTORY_FILTERS;
    return { ...EMPTY_DIRECTORY_FILTERS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_DIRECTORY_FILTERS;
  }
}

export function useDirectoryFilters() {
  const [filters, setFiltersState] = useState<DirectoryFilters>(readStoredFilters);

  const setFilters = useCallback((next: DirectoryFilters) => {
    setFiltersState(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage unavailable (private mode, etc.) — filters still work in-memory
    }
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_DIRECTORY_FILTERS), [setFilters]);

  return { filters, setFilters, clearFilters };
}
