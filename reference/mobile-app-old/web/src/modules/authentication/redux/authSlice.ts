import { createSlice } from "@reduxjs/toolkit";
import type { Member } from "@/types/types";

interface AuthState {
  accessToken?: string;
  needAppUpdate?: boolean;
  currentUser?: {
    id: string;
    profilePicture?: string;
    phone: string;
    isSuperAdmin?: boolean;
    relatives: Member[];
    firstName?: string;
    lastName?: string;
    parent?: unknown;
    root?: unknown;
    pushTokens?: string[];
  } | null;
  pushToken?: string;
}

const initialState: AuthState = {
  currentUser: null,
  accessToken: "",
  pushToken: "",
  needAppUpdate: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const p = action.payload as Record<string, unknown> | null | undefined;
      state.currentUser = {
        id: String(p?.id ?? ""),
        phone: String(p?.phone ?? ""),
        profilePicture: p?.profilePicture as string | undefined,
        isSuperAdmin: p?.isSuperAdmin as boolean | undefined,
        firstName: p?.firstName as string | undefined,
        lastName: p?.lastName as string | undefined,
        relatives: (p?.relatives as Member[]) ?? [],
      };
    },

    setIsAppUpdateNeeded: (state, action) => {
      state.needAppUpdate = action.payload;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    removeAccessToken: (state) => {
      state.accessToken = "";
    },

    setPushToken: (state, action) => {
      state.pushToken = action.payload;
    },
    resetAuth: (state) => {
      state.currentUser = null;
      state.accessToken = "";
      state.pushToken = "";
      state.needAppUpdate = false;
    },
  },
});

export const {
  setUser,
  setPushToken,
  setAccessToken,
  removeAccessToken,
  resetAuth,
  setIsAppUpdateNeeded,
} = authSlice.actions;

export default authSlice.reducer;
