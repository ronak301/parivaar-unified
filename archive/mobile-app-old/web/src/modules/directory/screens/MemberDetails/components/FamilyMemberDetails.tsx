import { map } from "lodash";
import { Title } from "../../CommunityDetailsScreen/CommunityDetailsScreen";
import { sortedRelatives } from "../sortedRelatives";
import FamilyMemberItem from "./FamilyMemberItem";
import type { Member } from "@/types/types";
import Box from "@/components/ui/Box";
import FamilyHead from "./FamilyHead";
import SpouseKids from "./SpouseKids";
import AddFamilyMemberButton from "./AddFamilyMemberButton";
import { useProfileExtraInfo } from "@/modules/profile/utils";

export default function FamilyMemberDetails({
  memberDetails,
  showAddFamilyMemberButton,
}: {
  memberDetails: Member;
  showAddFamilyMemberButton: boolean;
}) {
  const { isFamilyHead } = useProfileExtraInfo(memberDetails);

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
        {map(sortedRelatives(memberDetails?.relatives), (relative, index) => (
          <FamilyMemberItem key={relative.id ?? index} relative={relative} />
        ))}
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
}
