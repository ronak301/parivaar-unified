import { Dimensions, PixelRatio, View } from "react-native";
import React from "react";
import { useTheme } from "./theme";

const SeperatorComponent = ({ height = 1, style = {} }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          width: "100%",
          height,
          backgroundColor: colors?.border,
        },
        style,
      ]}
    />
  );
};

export default SeperatorComponent;
