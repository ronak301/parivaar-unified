import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "src/ui";
import { useDispatch, useSelector } from "react-redux";
import { setCommunity } from "src/modules/directory/redux/communitySlice";
import { Text } from "src/ui/Text";
import ImageViewer from "src/ui/ImageViewer";
import { RootState } from "src/app/store";
import { useConfigManager } from "src/hooks/useConfigManager";
import { getNextScreen } from "src/modules/directory/utils/navigation";
import * as Haptics from "expo-haptics";

const CommunityItem = ({ item }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const { getCommunityConfig } = useConfigManager({});

  const communityConfig = getCommunityConfig(item?.id);

  const nextScreen = getNextScreen(communityConfig, item?.id);

  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 8,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => {
        Haptics?.selectionAsync();
        setTimeout(() => {
          router?.push({
            pathname: nextScreen,
            params: {
              id: item?.id,
            },
          });
        }, 0);
        dispatch(
          setCommunity({
            ...(selectedCommunity?.id === item?.id && selectedCommunity),
            ...item,
          })
        );
      }}>
      <ImageViewer
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
        }}
        url={item?.logo}
      />
      <View
        style={{
          flex: 1,
          paddingLeft: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text bold style={{ fontSize: 16, fontWeight: "600" }}>
            {item?.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textLight,
              fontFamily: null,
              paddingTop: 4,
              fontWeight: "400",
            }}>
            {item?.description}
          </Text>
        </View>
        <View style={{ marginRight: 8 }}>
          <Ionicons name="chevron-forward-outline" size={20} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CommunityItem;
