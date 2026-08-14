import { View } from "react-native";
import React from "react";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import { sortedRelatives } from "./Profile";
import { filter, isEmpty, map } from "lodash";
import FamilyMemberItem from "./FamilyMemberItem";
import { Member } from "src/types/types";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";

type Props = {
  memberDetails: Member;
};

const SpouseKids = ({ memberDetails }: Props) => {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const spouse =
    filter(
      memberDetails?.relatives,
      (rel) =>
        rel?.relationship?.type === "Wife" ||
        rel?.relationship?.type === "Husband"
    ) || [];

  const kids =
    filter(
      memberDetails?.relatives,
      (rel) =>
        rel?.relationship?.type === "Son" ||
        rel?.relationship?.type === "Daughter"
    ) || [];

  const spouseAndKids = [...spouse, ...kids];

  const getTitle = () => {
    if (spouse?.length > 0 && kids?.length > 0) {
      return "Spouse & Kids";
    } else if (kids?.length === 0 && spouse?.length > 0) {
      return "Spouse";
    } else if (kids?.length > 0) {
      return "Kids";
    } else {
      return "";
    }
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
    getFamilyMembers(),
    (member) => member?.id !== memberDetails?.root?.id
  );

  if (isEmpty(updatedFamilyMembers)) {
    return null;
  }

  return (
    <View>
      <Title
        size={16}
        style={{ paddingLeft: 16, paddingBottom: 0, paddingTop: 16 }}>
        {getTitle()}
      </Title>
      {map(sortedRelatives(getFamilyMembers()), (relative, index) => {
        return <FamilyMemberItem key={index} relative={relative} />;
      })}
    </View>
  );
};

export default SpouseKids;
