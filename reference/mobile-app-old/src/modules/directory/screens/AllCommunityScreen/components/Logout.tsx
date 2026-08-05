import { Text, Alert } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useLogout } from "src/modules/authentication/hooks/useLogout";

const Logout = () => {
  const { logout } = useLogout();

  return (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
      onPress={async () => {
        Alert.alert("Are your sure you want to logout?", "", [
          {
            text: "No",
          },
          {
            text: "Yes",
            onPress: logout,
          },
        ]);
      }}>
      <Text style={{ color: "white", marginLeft: 8 }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default Logout;
