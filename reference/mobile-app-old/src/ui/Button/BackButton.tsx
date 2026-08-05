import { TouchableOpacity } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

type Props = {
  appearance?: "dark" | "light";
};

export function BackButton({ appearance = "light" }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      hitSlop={{ left: 12, right: 12, bottom: 12, top: 12 }}
      style={{
        backgroundColor: appearance === "dark" ? "white" : "#f1f1f1",
        width: 24,
        height: 24,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
      }}
      onPress={() => {
        Haptics.selectionAsync();
        setTimeout(() => {
          router?.back();
        }, 0);
      }}>
      <Ionicons name="chevron-back-outline" size={20} color="#000" />
    </TouchableOpacity>
  );
}
