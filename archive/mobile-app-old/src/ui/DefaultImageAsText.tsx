import { View, ViewStyle } from "react-native";
import React from "react";
import { getRandomColors } from "src/utils/utils";
import { upperCase } from "lodash";
import { Text } from "./Text";

type Props = {
  initials: string[];
  style?: ViewStyle;
  as?: "normal" | "executive" | "familymember";
};

const DefaultImageAsText = ({ as, style, initials = ["", ""] }: Props) => {
  const { light, dark } = getRandomColors();
  const IMAGE_SIZE = as === "familymember" ? 54 : 78;
  return (
    <View
      style={[
        {
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: 8,
          backgroundColor: light,
          alignItems: "center",
          justifyContent: "center",
          borderColor: dark,
          borderWidth: 0.5,
        },
        style,
      ]}>
      <Text
        bold
        style={{
          fontSize: 22,
          color: dark,
          fontWeight: "600",
          marginTop: 2,
        }}>
        {upperCase(
          `${initials[0]?.charAt(0) || ""}${initials[1]?.charAt(0) || ""}`
        )}
      </Text>
    </View>
  );
};

export default DefaultImageAsText;
