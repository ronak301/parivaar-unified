import { View, TouchableOpacity } from "react-native";
import React from "react";
import SearchBar from "./SearchBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "src/ui";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { getIfAnyFilterPresent } from "src/utils/utils";
import Check from "src/ui/Check";
import { Text } from "src/ui/Text";

export default function SearchBarContainer() {
  const router = useRouter();
  const { colors } = useTheme();
  const filters = useSelector((state: RootState) => state?.search?.filter);

  const isAnyFilterPresent = getIfAnyFilterPresent(filters);
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "black",
      }}>
      <SearchBar />
      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: 32,
          width: 80,
          backgroundColor: "white",
          borderRadius: 999,
          marginLeft: 8,
        }}
        hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
        onPress={() => {
          setTimeout(() => {
            router.push({
              pathname: `/search/filters`,
            });
          }, 0);
        }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Check ifPresent={isAnyFilterPresent}>
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 0,
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: colors.red,
              }}></View>
          </Check>
          <Text style={{ marginRight: 2, paddingTop: 4, fontSize: 14 }}>
            Filters
          </Text>
          <Ionicons name="filter-outline" size={12} color="#000" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
