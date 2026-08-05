import { View, ActivityIndicator, Platform } from "react-native";
import React from "react";
import { Text } from "./Text";
import { useTheme } from "./theme";

const LoadingComponent = () => {
  const size = Platform.OS === "ios" ? "small" : "large";
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bluishBackground,
      }}>
      <ActivityIndicator size={size} color={"black"} />
      <Text style={{ marginTop: 4 }}>Loading...</Text>
    </View>
  );
};

export default LoadingComponent;
