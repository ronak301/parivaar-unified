import { createSlice } from "@reduxjs/toolkit";
import { Community, Member } from "src/types/types";

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
    parent?: any;
    root?: any;
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
      state.currentUser = {
        id: action.payload?.id,
        phone: action?.payload?.phone,
        profilePicture: action?.payload?.profilePicture,
        isSuperAdmin: action?.payload?.isSuperAdmin,
        firstName: action?.payload?.firstName,
        lastName: action?.payload?.lastName,
        relatives: action?.payload?.relatives,
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
} = authSlice?.actions;

export default authSlice.reducer;
