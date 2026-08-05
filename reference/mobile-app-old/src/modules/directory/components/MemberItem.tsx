import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Executive, Member, Relative } from "src/types/types";
import {
  filterAndGetFirstRole,
  getBloodGroupDisplay,
  getBusinessTypeDisplay,
  getCapitalizedName,
} from "src/utils/utils";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";
import { BloodDropIcon } from "assets";
import { useRouter } from "expo-router";
import MemberImage from "src/ui/MemberImage";
import SeperatorComponent from "src/ui/SeperatorComponent";
import Check from "src/ui/Check";
import MemberExtraInfo from "./MemberExtraInfo";
import * as Haptics from "expo-haptics";

type Props = {
  member: Member | Executive | Relative;
  as?: "normal" | "executive" | "familymember";
  showSeperator?: boolean;
  style?: any;
  onPress?: () => void;
};

function MemberItem({
  member,
  as,
  showSeperator = true,
  style,
  onPress,
}: Props) {
  const isExecutive = as === "executive";
  const isFamilyMember = as === "familymember";
  const router = useRouter();

  const occupation =
    member?.business?.name ||
    getBusinessTypeDisplay(member?.business?.type) ||
    member?.education;

  const shouldShowBloodGroup = member?.bloodGroup && !isFamilyMember;
  const shouldShowOccupation = !!occupation && !isFamilyMember;

  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => {
        Haptics?.selectionAsync();
        if (onPress) {
          onPress();
          return;
        }
        router.push(`/member/${member?.id}`);
      }}>
      <View
        style={[
          {
            backgroundColor: "white",
            paddingVertical: 12,
            marginHorizontal: 8,
            marginVertical: 4,
            borderRadius: 16,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            minHeight: 76,
          },
          style,
        ]}>
        <View>
          <MemberImage
            url={member?.profilePicture}
            initials={[member?.firstName, member?.lastName]}
            as={as}
          />
        </View>
        <View
          style={{
            paddingLeft: 12,
            flex: 1,
            justifyContent: "center",
          }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Text
              bold
              numberOfLines={1}
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.textDark,
              }}>
              {getCapitalizedName(member)}
            </Text>

            <MemberExtraInfo member={member} isFamilyMember={isFamilyMember} />
          </View>
          {member?.phone ? (
            <Text
              style={{
                fontSize: isExecutive ? 12 : 14,
                color: colors.textLight,
                fontWeight: "500",
                fontFamily: "poppins",
                marginBottom: isExecutive ? 4 : 0,
              }}>
              {`${member?.phone}`}
            </Text>
          ) : null}
          {isFamilyMember ? null : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 2,
                height: 20,
              }}>
              {isExecutive ? (
                <View
                  style={{
                    backgroundColor: "#1a81ff",
                    paddingHorizontal: 8,
                    justifyContent: "center",
                    borderRadius: 999,
                    height: 24,
                  }}>
                  <Text
                    bold
                    style={{
                      fontSize: 14,
                      paddingTop: 4,
                      color: "white",
                      fontFamily: null,
                    }}>
                    {filterAndGetFirstRole(member?.executive?.roles)}
                  </Text>
                </View>
              ) : shouldShowOccupation ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    flex: 1,
                    marginRight: 8,
                    color: colors.textLight,
                    fontWeight: "500",
                    fontFamily: "poppins",
                    paddingTop: 2,
                  }}>
                  {occupation}
                </Text>
              ) : (
                <View />
              )}
              {shouldShowBloodGroup ? (
                <View
                  style={{
                    paddingHorizontal: 6,
                    borderRadius: 999,
                    paddingVertical: 2,
                    backgroundColor: colors.lightRed,
                    borderColor: colors.red,
                    borderWidth: 1,
                    flexDirection: "row",
                    paddingTop: 3,
                  }}>
                  <View style={{ marginTop: 0.5 }}>
                    <BloodDropIcon />
                  </View>
                  <Text
                    style={{
                      paddingTop: -2,
                      marginLeft: 2,
                      color: colors.red,
                      fontSize: 12,
                    }}>
                    {getBloodGroupDisplay(member?.bloodGroup)}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>
      <Check ifPresent={showSeperator}>
        <SeperatorComponent />
      </Check>
    </TouchableOpacity>
  );
}

export default React.memo(MemberItem);
