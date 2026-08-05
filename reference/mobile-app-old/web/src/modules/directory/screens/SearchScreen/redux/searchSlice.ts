import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Member } from "@/types/types";

export type LastSearchSnapshot = {
  communityId: string;
  fingerprint: string;
  rows: Member[];
  count: number;
};

interface SearchState {
  query?: string;
  filter?: {
    skip?: number;
    limit?: number;
    bloodGroup?: string | { id: string };
    locality?: string;
    businessType?: string;
    showUnmarried?: boolean;
    age?: {
      max: 100;
      min: 0;
    };
    gender?: string | null;
  };
  shouldReloadResults?: boolean;
  /** Last successful search (non-empty query) for instant re-display. */
  lastSearchSnapshot?: LastSearchSnapshot | null;
}

const initialState: SearchState = {
  filter: {
    skip: 0,
    limit: 1000,
  },
  lastSearchSnapshot: null,
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action?.payload;
    },
    addFilter: (state, action) => {
      state.filter = {
        ...state.filter,
        ...action.payload,
      };
    },
    removeFilter: (state) => {
      state.query = "";
      state.filter = {
        skip: 0,
        limit: 1000,
      };
    },
    setShouldReloadSearchResults: (state, action) => {
      state.shouldReloadResults = action?.payload;
    },
    setLastSearchSnapshot: (state, action: PayloadAction<LastSearchSnapshot | null>) => {
      state.lastSearchSnapshot = action.payload;
    },
  },
});

export const {
  addFilter,
  removeFilter,
  setQuery,
  setShouldReloadSearchResults,
  setLastSearchSnapshot,
} = searchSlice.actions;

export default searchSlice.reducer;
