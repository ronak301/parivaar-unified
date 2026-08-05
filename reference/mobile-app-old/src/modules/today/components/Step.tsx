import { View, Text } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "src/ui";
import Check from "src/ui/Check";

const Step = ({ label, state, isFirst, isLast }: Props) => {
  const { colors } = useTheme();
  let backgroundColor;
  let borderColor;
  let iconName;

  const stepWidth = 24;

  switch (state) {
    case "SUCCESS":
      {
        backgroundColor = colors.green;
        borderColor = colors.green;
        iconName = "checkmark";
      }
      break;
    case "ERROR":
      {
        backgroundColor = colors.red;
        borderColor = colors.red;
        iconName = "close";
      }
      break;
    case "PENDING":
      {
        backgroundColor = "white";
        borderColor = colors.yellow;
        iconName = "";
      }
      break;
    case "INACTIVE":
      {
        backgroundColor = colors.borderDark;
        borderColor = colors.borderDark;
        iconName = "";
      }
      break;
    default: {
      backgroundColor = "white";
    }
  }

  return (
    <View style={{ justifyContent: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: stepWidth,
            height: 1,
            backgroundColor: isFirst ? "white" : borderColor,
          }}
        />

        <View
          style={{
            width: 24,
            height: 24,
            borderColor,
            borderWidth: 1,
            borderRadius: 999,
            backgroundColor,
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Check ifPresent={iconName}>
            <Ionicons name={iconName} size={16} color={"white"} />
          </Check>
        </View>
        <View
          style={{
            width: stepWidth,
            height: 1,
            backgroundColor: isLast ? "white" : borderColor,
          }}
        />
      </View>
      <View style={{ alignItems: "center", paddingTop: 8 }}>
        <Text style={{ fontSize: 12 }}>{label}</Text>
      </View>
    </View>
  );
};

export default Step;
