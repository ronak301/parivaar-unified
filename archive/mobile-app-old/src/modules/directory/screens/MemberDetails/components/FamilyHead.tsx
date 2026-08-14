import { View } from "react-native";
import React from "react";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import FamilyMemberItem from "./FamilyMemberItem";
import { Member } from "src/types/types";
import { useCommunityConfig } from "src/hooks/useCommunityConfig";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";

type Props = {
  memberDetails: Member;
};

const FamilyHead = ({ memberDetails }: Props) => {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const shouldShow = selectedCommunity?.showFamilyMembers === "ALL";

  if (!shouldShow) return null;
  return (
    <View>
      <Title
        size={16}
        style={{ paddingLeft: 16, paddingBottom: 0, paddingTop: 8 }}>
        Family Head
      </Title>
      <FamilyMemberItem
        key={memberDetails?.root?.id}
        relative={memberDetails?.root}
      />
    </View>
  );
};

export default FamilyHead;
