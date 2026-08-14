import { Linking, TouchableOpacity, View } from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import { Text } from "src/ui/Text";

const Footer = () => {
  const { colors } = useTheme();

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ textAlign: "center", marginBottom: "10%", paddingTop: 8 }}>
        Made with ❤️ in India 🇮🇳
      </Text>
      <View style={{ flexDirection: "row", alignSelf: "center" }}>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL("https://parivaarapp.in/terms");
          }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: colors.primary,
            }}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
          }}>
          {" "}
          and{"  "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL("https://parivaarapp.in/privacy");
          }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: colors.primary,
            }}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Footer;
