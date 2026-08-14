import { configureStore } from "@reduxjs/toolkit";
import communityReducer from "src/modules/directory/redux/communitySlice";
import { applyMiddleware } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import logger from "redux-logger";
import authReducer from "src/modules/authentication/redux/authSlice";
import searchReducer from "src/modules/directory/screens/SearchScreen/redux/searchSlice";
import profileReducer from "src/modules/profile/redux/profileSlice";
import todayReducer from "src/modules/today/redux/today";

/**
 *
 */

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "community", "today"],
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
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
