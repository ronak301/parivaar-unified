import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useTheme } from "./theme";
import { Text } from "./Text";

type Props = {
  title?: string;
  subtitle?: string;
};

const ErrorComponent = ({
  title = "Something went wrong",
  subtitle = "Please check your internet connection and try later",
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        backgroundColor: "white",
        minHeight: 300,
      }}>
      <Image
        source={require("assets/empty.png")}
        style={{ width: 100, height: 100, borderRadius: 8 }}
      />
      <Text
        bold
        style={{
          fontSize: 16,
          textAlign: "center",
          color: colors.textDark,
        }}>
        {title}
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginTop: 8,
          fontSize: 14,
          fontWeight: "400",
          color: colors.textLight,
          fontFamily: "poppins",
        }}>
        {subtitle}
      </Text>
    </View>
  );
};

export default ErrorComponent;
