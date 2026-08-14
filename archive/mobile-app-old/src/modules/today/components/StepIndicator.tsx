import { View, Text } from "react-native";
import React from "react";
import Step from "./Step";
import moment from "moment";
import { map } from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";

const StepIndicator = () => {
  const yesterday = moment().subtract(1, "d");
  const today = moment();
  const day1 = moment().add(1, "d");
  const day2 = moment().add(2, "d");
  const day3 = moment().add(3, "d");

  const dailyGreetings = useSelector(
    (state: RootState) => state?.today?.dailyGreetings
  );

  const getDateFormat = (d) => {
    return d.format("DD MMM");
  };

  const getGreetingStatus = (d) => {
    const key = d.format("DDMMYYYY");
    return dailyGreetings[key];
  };

  const data = [
    {
      label: getDateFormat(yesterday),
      state: getGreetingStatus(yesterday) || "ERROR",
    },
    {
      label: "Today",
      state: getGreetingStatus(today) || "PENDING",
    },
    {
      label: getDateFormat(day1),
      state: "INACTIVE",
    },
    {
      label: getDateFormat(day2),
      state: "INACTIVE",
    },
    {
      label: getDateFormat(day3),
      state: "INACTIVE",
    },
  ];

  return (
    <View style={{ flexDirection: "row" }}>
      {map(data, (datum, index) => {
        const isFirst = index === 0;
        const isLast = index === data?.length - 1;
        return <Step {...datum} isFirst={isFirst} isLast={isLast} />;
      })}
    </View>
  );
};

export default StepIndicator;
