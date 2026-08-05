import { Linking, View } from "react-native";
import React from "react";
import { getBusinessTypeDisplay, getCapitalizedName } from "src/utils/utils";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CallIcon } from "assets";
import Check from "src/ui/Check";
import { capitalize } from "lodash";
import { useRouter } from "expo-router";

const BG_COLOR = ["#ACF", "#FFD3C5", "#CCFFD4", "#FFD3F8"];
const BusinessItem = ({ item, index }) => {
  const business = item?.business;
  const { colors } = useTheme();
  const router = useRouter();
  const bgColor = BG_COLOR[index % 4];
  return (
    <View
      style={{
        backgroundColor: bgColor,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        padding: 16,
      }}>
      <Text bold style={{ fontSize: 20, color: "black", paddingTop: 4 }}>
        {capitalize(business?.name)}
      </Text>

      <Check ifPresent={business?.type}>
        <View
          style={{
            marginTop: 4,
            flexDirection: "row",
          }}>
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: BG_COLOR[0] === bgColor ? BG_COLOR[2] : BG_COLOR[0],
              marginBottom: 8,
            }}>
            <Text style={{ fontSize: 10 }}>{`${getBusinessTypeDisplay(
              business?.type
            )}`}</Text>
          </View>
        </View>
      </Check>

      <Check ifPresent={!!business?.description}>
        <Text
          style={{
            paddingTop: 8,
            fontSize: 14,
            color: colors.textLight,
            paddingLeft: 4,
          }}>
          {business?.description}
        </Text>
      </Check>

      <Check ifPresent={business?.website}>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(business?.website);
          }}>
          <Text style={{ paddingTop: 8, fontSize: 12, color: colors.link }}>
            {business?.website}
          </Text>
        </TouchableOpacity>
      </Check>

      <TouchableOpacity
        onPress={() => {
          setTimeout(() => {
            router.push(`/member/${item?.business?.ownerId}`);
          }, 0);
        }}>
        <View
          style={{
            backgroundColor: "white",
            marginTop: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 16,
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <View>
            <Text
              bold
              style={{
                fontSize: 14,
                color: colors?.primary,
              }}>
              {capitalize(`${item?.firstName || ""} ${item?.lastName || ""}`)}
            </Text>
            <Check ifPresent={!!item.phone}>
              <Text
                bold
                style={{
                  fontSize: 12,
                  color: colors?.primary,
                  marginTop: 4,
                }}>
                {item?.phone}
              </Text>
            </Check>
          </View>
          <Check ifPresent={!!item.phone}>
            <TouchableOpacity
              style={{
                marginRight: 8,
              }}
              onPress={() => {
                Linking.openURL(`tel:+91${item.phone}`);
              }}>
              <CallIcon width={32} height={32} />
            </TouchableOpacity>
          </Check>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessItem;
