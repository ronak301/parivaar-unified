import { View, ViewStyle } from "react-native";
import React from "react";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Box = ({ children, style }: Props) => {
  return (
    <View
      style={[
        {
          marginTop: 8,
          marginHorizontal: 8,
          borderRadius: 8,
          backgroundColor: "white",
          paddingVertical: 16,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

export default Box;
