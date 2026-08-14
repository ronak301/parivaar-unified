import {
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import { useApi } from "src/api/useApi";
import { deleteUser } from "src/api/authApi";
import { useNavigation, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { resetAuth } from "src/modules/authentication/redux/authSlice";
import Check from "src/ui/Check";
import { useProfileExtraInfo } from "src/modules/profile/utils";
import { setShouldReloadSearchResults } from "../../SearchScreen/redux/searchSlice";
import { useLogout } from "src/modules/authentication/hooks/useLogout";
import Box from "src/ui/Box";

const DeleteAccount = ({ memberDetails }) => {
  const { colors } = useTheme();

  const { request: deleteAccountApi } = useApi(deleteUser);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isSelfProfile } = useProfileExtraInfo(memberDetails);
  const { logout } = useLogout();

  return (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          "Are you sure you want to permanantly delete Account?",
          "This will delete all of the data associated with this account",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Yes, Delete",
              onPress: async () => {
                await deleteAccountApi(memberDetails?.id);
                if (isSelfProfile) {
                  logout();
                } else {
                  dispatch(setShouldReloadSearchResults(true));
                  navigation?.goBack();
                }
              },
            },
          ]
        );
      }}>
      <Box style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: colors?.red }}>Delete Account</Text>
        <Text style={{ color: colors?.textLight, fontSize: 12 }}>
          (Only Super admin can see this)
        </Text>
        <Check ifPresent={loading}>
          <ActivityIndicator size="small" style={{ marginLeft: 4 }} />
        </Check>
      </Box>
    </TouchableOpacity>
  );
};

export default DeleteAccount;
