import { useDispatch } from "react-redux";
import { resetAuth } from "../redux/authSlice";
import { resetCommunities } from "src/modules/directory/redux/communitySlice";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { resetToday } from "src/modules/today/redux/today";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = useCallback(() => {
    dispatch(resetAuth());
    dispatch(resetCommunities());
    dispatch(resetToday());
    router.replace("login");
  }, []);

  const clearReduxState = useCallback(() => {
    // dispatch(resetAuth());
    // dispatch(resetCommunities());
    dispatch(resetToday());
  }, []);

  return {
    logout,
    clearReduxState,
  };
};
