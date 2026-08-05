import { View } from "react-native";
import React from "react";
import { BackButton } from "src/ui/Button";
import SearchBarContainer from "../../components/SearchBarContainer";

const Header = () => {
  return (
    <View
      style={{
        height: 104,
        width: "100%",
        paddingHorizontal: 12,
        backgroundColor: "black",
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: 34,
          alignItems: "center",
        }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}>
          <BackButton />
          <View style={{ marginLeft: 0, flex: 1 }}>
            <SearchBarContainer />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;
