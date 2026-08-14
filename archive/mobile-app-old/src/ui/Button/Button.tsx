import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";
import React from "react";
import { useTheme } from "../theme";
import { Text } from "../Text";

export function Button({
  loading,
  title,
  onPress,
  disabled,
  variant = "solid",
  style,
  iconPlacement = "right",
  icon,
  size = "lg",
  ...rest
}: TouchableOpacityProps & {
  title?: string;
  loading?: boolean;
  variant?: "solid" | "outline";
  iconPlacement?: "left" | "right";
  icon?: any;
  size?: "md" | "lg";
}) {
  const { colors } = useTheme();
  const isOutline = variant === "outline";
  const bgColor = isOutline ? "white" : colors.primary;
  const textColor = isOutline ? colors.primary : "white";
  const borderColor = colors.primary;
  return (
    <TouchableOpacity
      style={[
        {
          opacity: disabled ? 0.6 : 1,
          height: size === "lg" ? 48 : 36,
          backgroundColor: bgColor,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor,
          paddingHorizontal: 16,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      <>
        {loading ? (
          <ActivityIndicator
            color={variant === "solid" ? "white" : colors.primary}
          />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {iconPlacement === "left" ? (
              <View style={{ marginRight: 4 }}>{icon}</View>
            ) : null}
            <Text
              style={{
                color: textColor,
                fontSize: size === "lg" ? 14 : 12,
              }}>
              {title}
            </Text>
            {iconPlacement === "right" ? (
              <View style={{ marginLeft: 2 }}>{icon}</View>
            ) : null}
          </View>
        )}
      </>
    </TouchableOpacity>
  );
}
