import { View, Text, Platform, Linking, Alert } from "react-native";
import React from "react";
import Check from "src/ui/Check";
import * as Application from "expo-application";
import { compareVersions } from "compare-versions";
import { Button } from "src/ui/Button";
import { useConfigManager } from "src/hooks/useConfigManager";

const UpdateAvailable = () => {
  const onPress = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/au/app/parivaarapp/id6458189643"
        : "https://play.google.com/store/apps/details?id=com.parivaarcommunityapp.parivaarcommunityapp";

    Linking.openURL(url);
  };

  const { config } = useConfigManager({});

  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);

  const applicationVersion = Application?.nativeApplicationVersion || "";

  React.useEffect(() => {
    (async () => {
      const platform =
        Platform.OS === "android"
          ? "currentVersionAndroid"
          : "currentVersionIos";
      const metadata = config?.appMeta[platform];
      const version = metadata?.version;
      if (
        version &&
        applicationVersion &&
        compareVersions(applicationVersion, version) < 0
      ) {
        setIsUpdateAvailable(true);
        Alert.alert(
          "New Version Available",
          "New Version of Parivaar app is available.",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Update",
              onPress,
            },
          ]
        );
      }
    })();
  }, []);

  return (
    <Check ifPresent={isUpdateAvailable}>
      <View
        style={{
          width: "100%",
          height: 54,
          backgroundColor: "black",
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Text style={{ color: "white" }}>New Version Available</Text>
        <Button style={{ height: 28 }} title="Update" onPress={onPress} />
      </View>
    </Check>
  );
};

export default UpdateAvailable;
