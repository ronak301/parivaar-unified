import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import communityReducer from "@/modules/directory/redux/communitySlice";
import authReducer from "@/modules/authentication/redux/authSlice";
import searchReducer from "@/modules/directory/screens/SearchScreen/redux/searchSlice";
import profileReducer from "@/modules/profile/redux/profileSlice";
import todayReducer from "@/modules/today/redux/todaySlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "community", "today", "profile", "search"],
};

const rootReducer = combineReducers({
  community: communityReducer,
  auth: authReducer,
  search: searchReducer,
  profile: profileReducer,
  today: todayReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
