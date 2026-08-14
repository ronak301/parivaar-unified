import { View, Text, Alert } from "react-native";
import React from "react";
import Check from "src/ui/Check";
import { Button } from "src/ui/Button";
import { Member } from "src/types/types";
import { useRouter } from "expo-router";

type Props = {
  showAddFamilyMemberButton: boolean;
  memberDetails: Member;
};

const AddFamilyMemberButton = ({
  showAddFamilyMemberButton,
  memberDetails,
}: Props) => {
  const router = useRouter();
  return (
    <Check ifPresent={showAddFamilyMemberButton}>
      <Button
        onPress={() => {
          Alert.alert(
            `Adding Family Member?`,
            `You are adding family member of ${memberDetails?.firstName} Ji`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Yes, Add",
                onPress: async () => {
                  router.push({
                    pathname: "/add-family-member",
                    params: {
                      user: JSON.stringify(memberDetails),
                    },
                  });
                },
              },
            ]
          );
        }}
        title="Add Family Member"
        variant="outline"
        style={{
          width: "90%",
          height: 40,
          alignSelf: "center",
          marginTop: 16,
        }}
      />
    </Check>
  );
};

export default AddFamilyMemberButton;
