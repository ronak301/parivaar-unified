import React from "react";

import { useNavigation } from "expo-router";
import { RootState } from "src/app/store";
import { useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import UserCommunities from "./components/UserCommunities";
import Logout from "./components/Logout";
import { updateUser } from "src/api/authApi";

export default function AllCommunitiesScreen() {
  const navigation = useNavigation();

  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Logout />,
    });
  });

  React.useEffect(() => {
    (async () => {
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
        {
          projectId: Constants?.expoConfig?.extra?.eas.projectId,
        }
      );
      await updateUser(currentUser?.id, {
        pushTokens: [expoPushToken],
      });
    })();
  }, []);

  const Component = currentUser?.isSuperAdmin
    ? UserCommunities
    : UserCommunities;

  return (
    <>
      <Component />
    </>
  );
}
