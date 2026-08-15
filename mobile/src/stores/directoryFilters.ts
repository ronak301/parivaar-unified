import { create } from 'zustand';
import type { SearchUsersFilters } from '../api/user';

interface DirectoryFiltersState {
  filters: SearchUsersFilters;
  setFilters: (filters: SearchUsersFilters) => void;
  clearFilters: () => void;
}

export const useDirectoryFiltersStore = create<DirectoryFiltersState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
