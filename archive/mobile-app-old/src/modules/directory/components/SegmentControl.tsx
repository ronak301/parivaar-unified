import { View, Text } from "react-native";
import React from "react";
import { map } from "lodash";
import { TouchableOpacity } from "react-native";
import { normalize } from "src/ui/Text";

const SegmentControl = ({ values, onChangeIndex, selectedIndex }) => {
  return (
    <View
      style={{
        backgroundColor: "black",
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 8,
        height: 28,
        flexDirection: "row",
      }}>
      <>
        {map(values, (val, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              onPress={() => onChangeIndex(index)}
              key={val}
              style={{
                flex: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? "white" : "black",
              }}>
              <Text
                style={{
                  color: isSelected ? "black" : "white",
                  fontSize: 12,
                }}>
                {val}
              </Text>
            </TouchableOpacity>
          );
        })}
      </>
    </View>
  );
};

export default SegmentControl;
