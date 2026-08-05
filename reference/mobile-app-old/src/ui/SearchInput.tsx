import { View, Text } from "react-native";
import React from "react";
import { useTheme } from "./theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput } from "react-native";
import Check from "./Check";
import { TouchableOpacity } from "react-native";

const SearchInput = ({
  query = "",
  setQuery,
  placeholder = "Search",
  children = <View />,
}) => {
  const { colors } = useTheme();
  const inputRef = React.useRef(null);

  return (
    <View
      style={{
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "rgb(225,225,225)",
        paddingVertical: 4,
      }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#444444",
          borderRadius: 8,
          paddingHorizontal: 8,
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 4,
        }}>
        <Ionicons name="search" size={16} color={colors.border} />
        <TextInput
          style={{
            flex: 1,
            height: 36,
            fontSize: 14,
            color: "white",
            marginLeft: 6,
          }}
          ref={inputRef}
          value={query}
          caretHidden={false}
          selectionColor={colors?.primary}
          placeholder={placeholder}
          placeholderTextColor={"rgb(210,210,210)"}
          cursorColor="white"
          onChangeText={(text) => setQuery(text)}
        />
        <Check ifPresent={!!query}>
          <TouchableOpacity
            onPress={() => {
              inputRef?.current?.focus();
              setQuery("");
            }}
            hitSlop={{ left: 8, right: 8, top: 8, bottom: 8 }}
            style={{ position: "absolute", top: 8, right: 8 }}>
            <Ionicons name="close-circle" size={20} color={"#c3c3c3"} />
          </TouchableOpacity>
        </Check>
      </View>
      <View style={{ paddingHorizontal: 16 }}>{children}</View>
    </View>
  );
};

export default SearchInput;
