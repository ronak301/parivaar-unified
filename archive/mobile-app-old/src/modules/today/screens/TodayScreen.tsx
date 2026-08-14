import { View, ScrollView } from "react-native";
import React from "react";
import BirthdaysSection from "../components/BirthdaysSection";
import Spacer from "src/ui/Spacer";
import StatusScreen from "../components/StatusSection";
import StatusSection from "../components/StatusSection";
import GreetingSection from "../components/GreetingSection";
import { useTheme } from "src/ui";

const TodayScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors?.bluishBackground }}>
      {/* <GreetingSection />
      <Spacer height={12} /> */}
      {/* <StatusSection />
      <Spacer height={12} /> */}
      <BirthdaysSection />
    </View>
  );
};

export default TodayScreen;
