import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { Member } from "src/types/types";

export const useProfileExtraInfo = (profile: Member) => {
  const currentLoggedInUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  return {
    isSelfProfile: profile?.id === currentLoggedInUser?.id,
    isSuperAdmin: !!currentLoggedInUser?.isSuperAdmin,
    isFamilyHead: profile?.parent === null,
  };
};
