import { createSlice } from "@reduxjs/toolkit";
import { Community, Member } from "src/types/types";

interface AuthState {
  meta: {
    shouldUpdateUser?: boolean;
    shouldUpdateUserId?: string;
    currentOpenedUser: Member | null;
  };
}

const initialState: AuthState = {
  meta: {
    shouldUpdateUser: false,
    currentOpenedUser: null,
    shouldUpdateUserId: "",
  },
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileMeta: (state, action) => {
      state.meta = action.payload;
    },
    resetProfileMeta: (state) => {
      state.meta = initialState?.meta;
    },
  },
});

export const { setProfileMeta, resetProfileMeta } = profileSlice?.actions;

export default profileSlice.reducer;
