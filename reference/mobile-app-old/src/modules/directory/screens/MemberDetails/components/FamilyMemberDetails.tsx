import React from "react";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import { map } from "lodash";
import { sortedRelatives } from "./Profile";
import FamilyMemberItem from "./FamilyMemberItem";
import { useProfileExtraInfo } from "src/modules/profile/utils";
import { Member } from "src/types/types";
import Box from "src/ui/Box";
import FamilyHead from "./FamilyHead";
import SpouseKids from "./SpouseKids";
import Check from "src/ui/Check";
import { Button } from "src/ui/Button";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import AddFamilyMemberButton from "./AddFamilyMemberButton";

type Props = {
  memberDetails: Member;
  showAddFamilyMemberButton: boolean;
};

const FamilyMemberDetails = ({
  memberDetails,
  showAddFamilyMemberButton,
}: Props) => {
  const { isFamilyHead } = useProfileExtraInfo(memberDetails);
  const router = useRouter();

  if (isFamilyHead) {
    if (!memberDetails?.relatives?.length)
      return (
        <AddFamilyMemberButton
          showAddFamilyMemberButton={showAddFamilyMemberButton}
          memberDetails={memberDetails}
        />
      );
    return (
      <Box>
        <Title style={{ paddingLeft: 16, paddingTop: 0, paddingBottom: 0 }}>
          Family Members
        </Title>
        {map(sortedRelatives(memberDetails?.relatives), (relative, index) => {
          return <FamilyMemberItem key={index} relative={relative} />;
        })}
        <AddFamilyMemberButton
          showAddFamilyMemberButton={showAddFamilyMemberButton}
          memberDetails={memberDetails}
        />
      </Box>
    );
  }

  return (
    <Box>
      <FamilyHead memberDetails={memberDetails} />
      <SpouseKids memberDetails={memberDetails} />
      <AddFamilyMemberButton
        showAddFamilyMemberButton={showAddFamilyMemberButton}
        memberDetails={memberDetails}
      />
    </Box>
  );
};

export default FamilyMemberDetails;
