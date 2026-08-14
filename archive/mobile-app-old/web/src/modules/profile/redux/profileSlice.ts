import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Member } from "@/types/types";

interface ProfileState {
  meta: {
    shouldUpdateUser?: boolean;
    shouldUpdateUserId?: string;
    currentOpenedUser: Member | null;
  };
  memberByIdCache: Record<string, Member>;
}

const initialState: ProfileState = {
  meta: {
    shouldUpdateUser: false,
    currentOpenedUser: null,
    shouldUpdateUserId: "",
  },
  memberByIdCache: {},
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileMeta: (state, action) => {
      state.meta = action.payload;
    },
    resetProfileMeta: (state) => {
      state.meta = initialState.meta;
    },
    setMemberCache: (state, action: PayloadAction<{ id: string; member: Member }>) => {
      const { id, member } = action.payload;
      if (id) state.memberByIdCache[id] = member;
    },
    resetProfile: () => initialState,
  },
});

export const { setProfileMeta, resetProfileMeta, setMemberCache, resetProfile } = profileSlice.actions;

export default profileSlice.reducer;
