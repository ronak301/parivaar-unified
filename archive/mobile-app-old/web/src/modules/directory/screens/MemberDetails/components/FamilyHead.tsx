import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Member } from "@/types/types";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import FamilyMemberItem from "./FamilyMemberItem";

export default function FamilyHead({ memberDetails }: { memberDetails: Member }) {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const shouldShow = selectedCommunity?.showFamilyMembers === "ALL";
  if (!shouldShow) return null;

  const root = memberDetails?.root as import("@/types/types").Relative | undefined;
  if (!root) return null;

  return (
    <div>
      <Title size={16} style={{ paddingLeft: 16, paddingBottom: 0, paddingTop: 8 }}>
        Family Head
      </Title>
      <FamilyMemberItem relative={root} />
    </div>
  );
}
