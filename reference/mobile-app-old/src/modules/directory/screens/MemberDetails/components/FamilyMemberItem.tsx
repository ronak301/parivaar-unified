import { View } from "react-native";
import React from "react";
import MemberItem from "src/modules/directory/components/MemberItem";
import { Relative } from "src/types/types";

type Props = {
  relative: Relative;
};

const FamilyMemberItem = ({ relative, onPress }: Props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
      }}>
      <MemberItem
        member={relative}
        as="familymember"
        showSeperator={false}
        style={{
          marginHorizontal: 0,
          marginVertical: 0,
          paddingVertical: 0,
          paddingTop: 12,
        }}
      />
    </View>
  );
};

export default FamilyMemberItem;
