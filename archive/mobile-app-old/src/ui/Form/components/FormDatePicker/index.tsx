import { View, Text, Platform } from "react-native";
import React from "react";
import { FormDatePicker as DatePickerIOS } from "./FormDatePicker.ios";
import { FormDatePicker as DatePickerAndroid } from "./FormDatePicker.android";

const FormDatePicker = (props) => {
  if (Platform.OS === "ios") {
    return <DatePickerIOS {...props} />;
  }

  return <DatePickerAndroid {...props} />;
};

export default FormDatePicker;
