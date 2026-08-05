import { View, Text } from "react-native";
import React from "react";
import { useTheme } from "src/ui";

const Tag = ({ text }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 4,
        marginLeft: 4,
        backgroundColor: colors.lightGreen,
        paddingHorizontal: 4,
        borderColor: colors.green,
        borderWidth: 1,
        borderRadius: 4,
      }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 7,
        }}>
        {text}
      </Text>
    </View>
  );
};

export default Tag;
