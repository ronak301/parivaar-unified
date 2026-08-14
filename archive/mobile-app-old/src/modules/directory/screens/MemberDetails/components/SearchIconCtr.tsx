import { TouchableOpacity, View } from "react-native";
import React from "react";
import { SearchIcon } from "assets";
import { useRouter } from "expo-router";

const SearchIconCtr = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        setTimeout(() => {
          router.push("search/search");
        }, 0);
      }}
      hitSlop={{
        left: 40,
        right: 40,
        bottom: 20,
        top: 40,
      }}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderColor: "white",
        borderWidth: 2,
      }}>
      <View
        style={{
          backgroundColor: "white",
          width: 28,
          height: 28,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}>
        <SearchIcon />
      </View>
    </TouchableOpacity>
  );
};

export default SearchIconCtr;
