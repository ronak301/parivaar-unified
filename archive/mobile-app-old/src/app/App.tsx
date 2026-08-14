import React from "react";
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { RootState } from "./store";
import { sendEvent } from "src/api/events";
import { isEmpty } from "lodash";
import { setSentryUser } from "./SentryManager";

const App = () => {
  const currentLoggedInUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );
  const accessToken = useSelector(
    (state: RootState) => state?.auth?.accessToken
  );

  React.useEffect(() => {
    sendEvent(
      `App Open - ${currentLoggedInUser?.phone} ${currentLoggedInUser?.firstName} ${currentLoggedInUser?.lastName}`
    );
    setSentryUser({
      id: currentLoggedInUser?.id,
      phone: currentLoggedInUser?.phone,
      name: `${currentLoggedInUser?.firstName}`,
    });
  }, []);

  const isLoggedIn = !isEmpty(accessToken);

  return (
    <View style={{ backgroundColor: "white", flex: 1, marginTop: 84 }}>
      {isLoggedIn ? (
        <Redirect href="community/all" />
      ) : (
        <Redirect href="login" />
      )}
    </View>
  );
};

export default App;
