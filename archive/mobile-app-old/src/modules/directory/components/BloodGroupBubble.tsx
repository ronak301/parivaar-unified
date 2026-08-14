import { View, TouchableOpacity } from "react-native";
import React from "react";
import { KeyValuePair } from "src/utils/constants";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";

type Props = {
  isSelected?: boolean;
  bloodGroup: KeyValuePair;
  onPress: (bg: KeyValuePair) => void;
};

export default function BloodGroupBubble({
  isSelected,
  bloodGroup,
  onPress,
}: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      key={bloodGroup?.id}
      style={{
        width: 76,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: isSelected ? colors.red : "transparent",
        backgroundColor: "#FFEFEF",
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 999,
      }}
      onPress={() => onPress(bloodGroup)}>
      <Text style={{ marginTop: 2, fontFamily: "poppins" }}>
        {bloodGroup?.label}
      </Text>
    </TouchableOpacity>
  );
}
