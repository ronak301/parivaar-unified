import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "./Text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "./theme";
import Check from "./Check";
import Animated, { FadeInLeft } from "react-native-reanimated";

const TitleRow = ({
  isNew = false,
  title = "",
  showArrow = true,
  onPress = () => {},
  size = 18,
}) => {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInLeft.duration(500)}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDark,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}>
            <Text style={{ fontFamily: null, fontSize: size, paddingTop: 2 }}>
              {title}
            </Text>
            <Check ifPresent={isNew}>
              <View
                style={{
                  marginLeft: 4,
                  paddingHorizontal: 4,
                  borderRadius: 4,
                  borderColor: colors.green,
                  borderWidth: 2,
                  backgroundColor: colors.lightGreen,
                }}>
                <Text bold style={{ fontSize: 10, color: colors.green }}>
                  New
                </Text>
              </View>
            </Check>
          </View>

          <Ionicons name="chevron-forward-outline" size={20} color="#000" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TitleRow;
