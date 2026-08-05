import { useDispatch } from "react-redux";
import { resetAuth } from "@/modules/authentication/redux/authSlice";
import { resetCommunities } from "@/modules/directory/redux/communitySlice";
import { resetProfile } from "@/modules/profile/redux/profileSlice";
import { resetToday } from "@/modules/today/redux/todaySlice";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    dispatch(resetAuth());
    dispatch(resetCommunities());
    dispatch(resetProfile());
    dispatch(resetToday());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const clearReduxState = useCallback(() => {
    dispatch(resetToday());
  }, [dispatch]);

  return {
    logout,
    clearReduxState,
  };
}
