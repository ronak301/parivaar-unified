import { View } from "react-native";
import React from "react";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import PersonalInfo from "./PersonalInfo";
import BusinessInfo from "./BusinessInfo";

const MoreProfileInformation = ({ selectedIndex, setIndex }) => {
  return (
    <View style={{ backgroundColor: "white" }}>
      <View
        style={{
          marginHorizontal: 32,
          marginTop: 12,
          borderColor: "white",
          borderWidth: 1,
          borderRadius: 8,
        }}>
        <SegmentedControl
          values={["Personal", "Business"]}
          onChange={(event) => {
            setIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          selectedIndex={selectedIndex}
          style={{ marginBottom: 12 }}
        />
      </View>
      {selectedIndex === 0 ? <PersonalInfo /> : <BusinessInfo />}
    </View>
  );
};

export default MoreProfileInformation;
