import React from "react";
import { Linking, Platform, View } from "react-native";
import { Button } from "src/ui/Button";
import { Text } from "src/ui/Text";

const onPress = () => {
  const url =
    Platform.OS === "ios"
      ? "https://apps.apple.com/au/app/parivaarapp/id6458189643"
      : "https://play.google.com/store/apps/details?id=com.parivaarcommunityapp.parivaarcommunityapp";

  Linking.openURL(url);
};

export const UpdateRequired = () => (
  <View
    style={{
      backgroundColor: "white",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    }}>
    <View>
      <Text
        style={{ textAlign: "center", paddingBottom: 32, fontSize: 22 }}
        bold>
        Update required!
      </Text>
      <Text style={{ paddingBottom: 32, textAlign: "center" }}>
        Looks like your app is out of date! For the complete Parivaar App
        experience, you must update your application!
      </Text>
    </View>

    <Button style={{ width: "100%" }} onPress={onPress} title="Update Now" />
  </View>
);
