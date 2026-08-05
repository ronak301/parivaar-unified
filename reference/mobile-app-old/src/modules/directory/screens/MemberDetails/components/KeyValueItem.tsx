import { View } from "react-native";
import React from "react";
import Check from "src/ui/Check";
import { useTheme } from "src/ui";
import { capitalize, trim } from "lodash";
import { Text } from "src/ui/Text";

const KeyValueItem = ({ item }) => {
  const { colors } = useTheme();
  return (
    <Check ifPresent={trim(item.value)} key={item?.id}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}>
        <View
          style={{
            backgroundColor: item?.icon ? "#EEEEEE" : "transparent",
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
          }}>
          {item.icon || ""}
        </View>

        <View style={{ paddingLeft: 16, flex: 1 }}>
          <Text style={{ fontSize: 14, paddingTop: 2 }}>
            {capitalize(item?.value)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors?.textLight,
            }}>
            {item.displayName}
          </Text>
        </View>
      </View>
    </Check>
  );
};

export default KeyValueItem;
