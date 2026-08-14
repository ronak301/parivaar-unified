import { createSlice } from "@reduxjs/toolkit";
import { Community } from "src/types/types";

interface SearchState {
  query?: string;
  filter?: {
    skip?: number;
    limit?: number;
    bloodGroup?: string;
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
}

const initialState: SearchState = {
  filter: {
    skip: 0,
    limit: 1000,
  },
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
  },
});

export const {
  addFilter,
  removeFilter,
  setQuery,
  setShouldReloadSearchResults,
} = searchSlice?.actions;

export default searchSlice.reducer;
