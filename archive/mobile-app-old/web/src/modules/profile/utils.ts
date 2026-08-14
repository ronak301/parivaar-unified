import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Member } from "@/types/types";

export function useProfileExtraInfo(profile: Member | null | undefined) {
  const currentLoggedInUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  return {
    isSelfProfile: profile?.id === currentLoggedInUser?.id,
    isSuperAdmin: !!currentLoggedInUser?.isSuperAdmin,
    isFamilyHead: profile?.parent === null,
  };
}
