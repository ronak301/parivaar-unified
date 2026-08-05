import { Alert, View } from "react-native";
import React from "react";
import { Member } from "src/types/types";
import MemberItem from "src/modules/directory/components/MemberItem";
import { Button } from "src/ui/Button";
import { useApi } from "src/api/useApi";
import { addToCommunity } from "src/api/directoryApi";
import { useNavigation } from "expo-router";
import { Text } from "src/ui/Text";
import { useTheme } from "src/ui";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

type Props = {
  user: Member;
  communityId: string;
};

const AddUserToExistingCommunity = ({ user, communityId }: Props) => {
  const [addingToCommunity, setAddingToCommunity] = React.useState(false);
  const navigation = useNavigation();
  const { request: addToCommunityApi } = useApi(addToCommunity);
  const userId = user?.id;

  const addUserToCommunity = async () => {
    setAddingToCommunity(true);
    try {
      const result = await addToCommunityApi(communityId, userId);
      // console.log("resulttt", result?.data);
      if (result?.data?.success) {
        Toast.show({
          position: "bottom",
          type: "success",
          text1: `Success!!`,
          text2: `Successfully added ${user?.firstName} Ji to community`,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        navigation?.goBack();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Something went wrong. Please try again later");
      }
    } catch (err) {
    } finally {
      setAddingToCommunity(false);
    }
  };
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors?.bluishBackground,
        paddingVertical: 16,
      }}>
      <Text style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 }}>
        We have found this profile associated with number you entered. Would you
        like to add this user?
      </Text>
      <MemberItem member={user} onPress={() => {}} />
      <Button
        style={{ marginHorizontal: 16, marginBottom: 24 }}
        loading={addingToCommunity}
        onPress={addUserToCommunity}
        title="Add User To Community"
      />
    </View>
  );
};

export default AddUserToExistingCommunity;
