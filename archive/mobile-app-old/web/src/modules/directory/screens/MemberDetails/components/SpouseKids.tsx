import { filter, isEmpty, map } from "lodash";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Member } from "@/types/types";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import { sortedRelatives } from "../sortedRelatives";
import FamilyMemberItem from "./FamilyMemberItem";

export default function SpouseKids({ memberDetails }: { memberDetails: Member }) {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const spouse =
    filter(
      memberDetails?.relatives,
      (rel) =>
        rel?.relationship?.type === "Wife" || rel?.relationship?.type === "Husband"
    ) || [];

  const kids =
    filter(
      memberDetails?.relatives,
      (rel) =>
        rel?.relationship?.type === "Son" || rel?.relationship?.type === "Daughter"
    ) || [];

  const spouseAndKids = [...spouse, ...kids];

  const getTitle = () => {
    if (spouse?.length > 0 && kids?.length > 0) return "Spouse & Kids";
    if (kids?.length === 0 && spouse?.length > 0) return "Spouse";
    if (kids?.length > 0) return "Kids";
    return "";
  };

  const getFamilyMembers = () => {
    switch (selectedCommunity?.showFamilyMembers) {
      case "SINGLE":
        return null;
      case "ALL":
        return memberDetails?.relatives;
      case "SPOUSE":
        return [...spouse];
      case "SPOUSE&KIDS":
        return spouseAndKids;
      default:
        return memberDetails?.relatives;
    }
  };

  const updatedFamilyMembers = filter(
    getFamilyMembers() ?? [],
    (m) => m?.id !== (memberDetails?.root as { id?: string } | undefined)?.id
  );

  if (isEmpty(updatedFamilyMembers)) {
    return null;
  }

  return (
    <div>
      <Title size={16} style={{ paddingLeft: 16, paddingBottom: 0, paddingTop: 16 }}>
        {getTitle()}
      </Title>
      {map(sortedRelatives(getFamilyMembers() ?? []), (relative, index) => (
        <FamilyMemberItem key={relative.id ?? index} relative={relative} />
      ))}
    </div>
  );
}
