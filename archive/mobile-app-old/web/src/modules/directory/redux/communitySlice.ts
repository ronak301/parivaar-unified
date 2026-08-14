import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Config } from "@/hooks/useConfigManager";
import type { Community, Member } from "@/types/types";

export type MembersListCacheEntry = {
  rows: Member[];
  totalCount: number;
  totalMembers?: string;
  totalFamilyHeads?: string;
  /** True after a full bulk load completed (or migrated from older cache). */
  bulkLoaded?: boolean;
  /**
   * Server `isAccountManager: true` list when bulk rows omit flags — persisted so leaving Filters
   * / search routes does not refetch or lose the snapshot on remount.
   */
  familyHeadRows?: Member[];
};

export type BusinessListCacheEntry = {
  rows: Member[];
  bulkLoaded?: boolean;
};

interface CommunityState {
  selectedCommunity?: Community | null;
  allCommunities: Community[];
  selectedCommunityMembers: {
    id: string;
    data: Member[];
  };
  /** Cache-first members directory list keyed by community id. */
  membersListCache: Record<string, MembersListCacheEntry>;
  /** Business directory list keyed by community id. */
  businessListCache: Record<string, BusinessListCacheEntry>;
  config?: Config | Record<string, unknown>;
}

const initialState: CommunityState = {
  selectedCommunity: null,
  allCommunities: [],
  selectedCommunityMembers: {
    id: "",
    data: [],
  },
  membersListCache: {},
  businessListCache: {},
  config: {},
};

export const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    setCommunity: (state, action) => {
      state.selectedCommunity = action.payload;
    },
    setSelectedCommunityMembers: (state, action) => {
      state.selectedCommunityMembers = action.payload;
    },
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    /** Bulk roster replace — does not include `familyHeadRows` (see setFamilyHeadRowsCache). */
    setMembersListCache: (
      state,
      action: PayloadAction<{
        communityId: string;
        rows: Member[];
        totalCount: number;
        totalMembers?: string;
        totalFamilyHeads?: string;
        bulkLoaded?: boolean;
      }>
    ) => {
      const { communityId, rows, totalCount, totalMembers, totalFamilyHeads, bulkLoaded } = action.payload;
      const prev = state.membersListCache[communityId];
      state.membersListCache[communityId] = {
        rows,
        totalCount,
        totalMembers: totalMembers ?? prev?.totalMembers,
        totalFamilyHeads: totalFamilyHeads ?? prev?.totalFamilyHeads,
        bulkLoaded: bulkLoaded ?? prev?.bulkLoaded,
      };
    },
    /** Store family-head-only fetch; survives directory ↔ filters navigation without refetch. */
    setFamilyHeadRowsCache: (
      state,
      action: PayloadAction<{ communityId: string; rows: Member[] }>
    ) => {
      const { communityId, rows } = action.payload;
      const prev = state.membersListCache[communityId];
      if (!prev) return;
      prev.familyHeadRows = rows;
    },
    /** Clear after bulk refresh so family-head list is refetched if needed. */
    clearFamilyHeadRowsCache: (state, action: PayloadAction<string>) => {
      const e = state.membersListCache[action.payload];
      if (e) delete e.familyHeadRows;
    },
    setBusinessListCache: (state, action: PayloadAction<{ communityId: string } & BusinessListCacheEntry>) => {
      const { communityId, rows, bulkLoaded } = action.payload;
      const prev = state.businessListCache[communityId];
      state.businessListCache[communityId] = {
        rows,
        bulkLoaded: bulkLoaded ?? prev?.bulkLoaded,
      };
    },
    /** Clears cached members for a community so the next directory load refetches (e.g. after add member). */
    invalidateMembersListCache: (state, action: PayloadAction<string>) => {
      delete state.membersListCache[action.payload];
      delete state.businessListCache[action.payload];
    },
    removeCommunity: (state) => {
      state.selectedCommunity = null;
      state.selectedCommunityMembers = initialState.selectedCommunityMembers;
    },
    setAllCommunities: (state, action) => {
      state.allCommunities = action.payload;
    },
    removeAllCommunities: (state) => {
      state.allCommunities = [];
    },
    resetCommunities: (state) => {
      state.selectedCommunity = null;
      state.allCommunities = [];
      state.selectedCommunityMembers = {
        id: "",
        data: [],
      };
      state.membersListCache = {};
      state.businessListCache = {};
      state.config = {};
    },
  },
});

export const {
  setCommunity,
  removeCommunity,
  setSelectedCommunityMembers,
  setAllCommunities,
  setConfig,
  setMembersListCache,
  setFamilyHeadRowsCache,
  clearFamilyHeadRowsCache,
  setBusinessListCache,
  invalidateMembersListCache,
  removeAllCommunities,
  resetCommunities,
} = communitySlice.actions;

export default communitySlice.reducer;
