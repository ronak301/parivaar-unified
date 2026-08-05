import { View, Text } from "react-native";
import React from "react";

const Spacer = ({ height = 8 }) => {
  return (
    <View
      style={{
        backgroundColor: "rgb(231, 231, 231)",
        height,
        width: "100%",
      }}></View>
  );
};

export default Spacer;
