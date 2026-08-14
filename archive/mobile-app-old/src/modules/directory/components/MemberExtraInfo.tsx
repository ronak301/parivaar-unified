import { Linking, TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "src/ui/Text";
import { getFamilyRelationTypeDisplay } from "src/utils/utils";
import { CallIcon, WhatsappIcon } from "assets";

const SimpleTag = ({ text }) => {
  if (!text) return null;
  return (
    <View
      style={{
        backgroundColor: "#E8F2FF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        marginBottom: 4,
      }}>
      <Text bold style={{ fontWeight: "500", fontSize: 10, paddingTop: 2 }}>
        {text}
      </Text>
    </View>
  );
};

const MemberExtraInfo = ({ member, isFamilyMember }) => {
  const shouldShowRelation = isFamilyMember;
  return (
    <View>
      {shouldShowRelation ? (
        <SimpleTag
          text={getFamilyRelationTypeDisplay(member?.relationship?.type)}
        />
      ) : member?.phone ? (
        <View style={{ flexDirection: "row", marginLeft: 8 }}>
          <TouchableOpacity
            style={{
              marginRight: 8,
            }}
            onPress={() => {
              Linking.openURL(`tel:+91${member.phone}`);
            }}>
            <CallIcon width={32} height={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`https://wa.me/${member?.phone}`);
            }}>
            <WhatsappIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default MemberExtraInfo;
