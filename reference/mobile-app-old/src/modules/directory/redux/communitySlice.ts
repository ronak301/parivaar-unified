import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Config } from "src/hooks/useConfigManager";
import { Community, Member } from "src/types/types";

export type BusinessListCacheEntry = {
  rows: Member[];
  bulkLoaded?: boolean;
};

interface CommunityState {
  selectedCommunity?: Community | null;
  allCommunities: any[];
  selectedCommunityMembers: {
    id: string;
    data: Member[];
  };
  /** Keyed by community id — avoids refetching business list on every tab visit. */
  businessListCache: Record<string, BusinessListCacheEntry>;
  config?: Config | {};
}

const initialState: CommunityState = {
  selectedCommunity: null,
  allCommunities: [],
  selectedCommunityMembers: {
    id: "",
    data: [],
  },
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
    setBusinessListCache: (
      state,
      action: PayloadAction<{ communityId: string } & BusinessListCacheEntry>
    ) => {
      const { communityId, rows, bulkLoaded } = action.payload;
      const prev = state.businessListCache[communityId];
      state.businessListCache[communityId] = {
        rows,
        bulkLoaded: bulkLoaded ?? prev?.bulkLoaded,
      };
    },
    removeCommunity: (state) => {
      state.selectedCommunity = null;
      state.selectedCommunityMembers = initialState?.selectedCommunityMembers;
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
  setBusinessListCache,
  removeAllCommunities,
  resetCommunities,
} = communitySlice?.actions;

export default communitySlice.reducer;
