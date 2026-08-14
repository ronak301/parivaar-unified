import { View, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { setQuery } from "../screens/SearchScreen/redux/searchSlice";
import Check from "src/ui/Check";
import * as Haptics from "expo-haptics";

export default function SearchBar() {
  const { colors } = useTheme();
  const query = useSelector((state: RootState) => state?.search?.query);
  const dispatch = useDispatch();
  const inputRef = React.useRef(null);
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#444444",
        borderRadius: 8,
        paddingHorizontal: 8,
      }}>
      <Ionicons name="search" size={16} color={colors.border} />
      <TextInput
        style={{
          flex: 1,
          height: 40,
          fontSize: 16,
          color: "white",
          marginLeft: 6,
        }}
        ref={inputRef}
        value={query}
        autoFocus
        caretHidden={false}
        selectionColor={colors?.primary}
        placeholder="Search name, number etc"
        placeholderTextColor="white"
        cursorColor="white"
        onChangeText={(text) => {
          Haptics?.selectionAsync();
          return dispatch(setQuery(text));
        }}
      />
      <Check ifPresent={!!query}>
        <TouchableOpacity
          onPress={() => {
            inputRef?.current?.focus();
            dispatch(setQuery(""));
          }}
          hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
          style={{ position: "absolute", top: 12, right: 12 }}>
          <Ionicons name="close-circle" size={20} color={"#c3c3c3"} />
        </TouchableOpacity>
      </Check>
    </View>
  );
}
