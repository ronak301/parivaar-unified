import { View } from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";

const TextTile = ({ children }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.darkBackground,
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 16,
        paddingHorizontal: 8,
      }}>
      {children}
    </View>
  );
};

export default TextTile;
