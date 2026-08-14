import { TouchableOpacity, View } from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";
import { useRouter } from "expo-router";
import { isEmpty } from "lodash";
import { Image } from "expo-image";

const MemberTile = ({
  size = 120,
  profilePicture,
  name,
  role,
  id = "",
  number = "",
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const Element = isEmpty(id) ? View : TouchableOpacity;
  return (
    <Element
      onPress={() => {
        if (isEmpty(id)) return;
        setTimeout(() => {
          router.push(`/member/${id}`);
        }, 0);
      }}
      style={{
        width: size,
        alignItems: "center",
        padding: 8,
        backgroundColor: colors.darkBackground,
        borderRadius: 8,
        marginRight: 8,
      }}>
      <Image
        style={{ width: size - 40, height: size - 40, borderRadius: 999 }}
        source={profilePicture}
      />
      <Text
        bold
        style={{
          color: "white",
          fontSize: 8,
          paddingTop: 12,
        }}>
        {name}
      </Text>
      <Text bold style={{ color: "white", fontSize: 8, paddingTop: 2 }}>
        {role}
      </Text>
      <Text bold style={{ color: "white", fontSize: 8, paddingTop: 2 }}>
        {number}
      </Text>
    </Element>
  );
};

export default MemberTile;
