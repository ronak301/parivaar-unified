import { View } from "react-native";
import React from "react";
import { Button } from "src/ui/Button";
import StepIndicator from "./StepIndicator";
import { Text } from "src/ui/Text";
import { useTheme } from "src/ui";
import { Image } from "expo-image";
import { useDispatch } from "react-redux";
import { addDailyGreetings } from "../redux/today";
import moment from "moment";

const GreetingSection = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const today = moment();
  const yesterday = moment().subtract(1, "d");

  const onPressGreeting = () => {
    const today = moment().format("DDMMYYYY");
    dispatch(addDailyGreetings({ [today]: "SUCCESS" }));
  };

  const numberOfDays = 1;
  const days = `${numberOfDays} Day${numberOfDays > 1 ? "s" : ""}`;

  return (
    <View
      style={{
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}>
        <Image
          source={require("assets/hand.png")}
          style={{
            width: 40,
            height: 40,
            borderColor: colors.borderDark,
            borderWidth: 1,
            borderRadius: 999,
          }}
        />
        <Text bold style={{ fontSize: 18 }}>
          Say today's Jai Jinendra
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            backgroundColor: colors?.red,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}>
          <Text bold style={{ color: "white", paddingTop: 8 }}>
            {days}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center", paddingBottom: 32, paddingTop: 16 }}>
        <StepIndicator />
      </View>

      <Button
        onPress={onPressGreeting}
        variant="solid"
        title="Say Jai Jinendra"
      />
    </View>
  );
};

export default GreetingSection;
