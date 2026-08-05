import React from "react";
import App from "./App";
import { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { View } from "react-native";
import { UpdateRequired } from "src/modules/authentication/screens/LoginScreen/components/UpdateRequired";
import NotificationManager from "./NotificationManager";
import { initSentry } from "./SentryManager";
import { useConfigManager } from "src/hooks/useConfigManager";
import LoadingComponent from "src/ui/LoadingComponent";
import { useFontLoader } from "./FontLoader";

const AppContainer = () => {
  useFontLoader();
  const [updateNeeded, setUpdateNeeded] = React.useState<boolean | undefined>(
    undefined
  );

  const { isAppVersionOK, loading } = useConfigManager({});

  React.useEffect(() => {
    initSentry();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (isAppVersionOK) {
        setUpdateNeeded(false);
      } else {
        setUpdateNeeded(true);
      }
    })();
  }, []);

  if (updateNeeded === undefined || loading) {
    return <LoadingComponent />;
  }

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationManager>
          {updateNeeded ? <UpdateRequired /> : <App />}
        </NotificationManager>
      </PersistGate>
    </View>
  );
};

export default AppContainer;
