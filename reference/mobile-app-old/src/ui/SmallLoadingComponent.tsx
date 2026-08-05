import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useTheme } from "./theme";

const SmallLoadingComponent = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{ marginTop: 16, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="small" color={colors?.primary} />
      <Text style={{ marginTop: 4 }}>Loading...</Text>
    </View>
  );
};

export default SmallLoadingComponent;
