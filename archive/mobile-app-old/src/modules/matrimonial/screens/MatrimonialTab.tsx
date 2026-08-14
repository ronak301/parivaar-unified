import React from "react";
import {
  SceneMap,
  SceneRendererProps,
  TabBar,
  TabView,
} from "react-native-tab-view";

import { View, useWindowDimensions } from "react-native";
import Girls from "src/modules/matrimonial/screens/Girls";
import Boys from "src/modules/matrimonial/screens/Boys";
import { useTheme } from "src/ui";

export default function MatrimonialTab() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <View
        style={{
          marginHorizontal: 32,
          marginTop: 12,
          borderColor: "white",
          borderWidth: 1,
          borderRadius: 8,
        }}>
        <SegmentedControl
          values={["Boys", "Girls"]}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          selectedIndex={selectedIndex}
          style={{ marginBottom: 12 }}
        />
      </View>
      {selectedIndex === 0 ? <Boys /> : <Girls />}
    </View>
  );
}

import SegmentedControl from "@react-native-segmented-control/segmented-control";
