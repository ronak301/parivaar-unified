import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Controller,
  UseControllerProps,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Text } from "src/ui/Text";
import moment from "moment";
import { FormLabel } from "../FormLabel";
import Check from "src/ui/Check";
import Ionicons from "@expo/vector-icons/Ionicons";

type FormDatePickerProps = {
  /**
   * The name of the input
   */
  name: string;

  /**
   * The label of the tooltip
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder: string;

  /**
   * If the component is disabled
   */
  disabled?: boolean;

  /**
   * onPress handler for inline action button
   * @returns void
   */
  onChange?: (val: string) => void;

  /**
   * field rules
   */
  rules?: UseControllerProps["rules"];

  /**
   *  optional children
   */
  children?: React.ReactNode;
};

export const FormDatePicker = React.forwardRef(
  (props: FormDatePickerProps, ref) => {
    const methods = useFormContext() as UseFormReturn & {
      formName: string;
    };

    const styles = StyleSheet.create({});

    const {
      name,
      label,
      placeholder,
      rules = {},
      disabled = false,
      ...rest
    } = props;

    if (methods === null) {
      return <Text>Missing form context</Text>;
    }

    if (!methods.formName) {
      return <Text>Missing form name</Text>;
    }

    return (
      <Controller
        name={name}
        control={methods.control}
        rules={rules}
        render={({ field }) => {
          const onChange = (event, selectedDate) => {
            field.onChange(moment(selectedDate)?.format("yyyy-MM-DD"));
          };

          return (
            <View style={{ marginBottom: 16, marginTop: 4 }}>
              <FormLabel label={label} />
              <View style={{ alignItems: "flex-start" }}>
                <DateTimePicker
                  display="compact"
                  testID="dateTimePicker"
                  value={new Date(field?.value)}
                  onChange={onChange}
                />
                <Check ifPresent={field?.value}>
                  <TouchableOpacity
                    onPress={() => {
                      field.onChange(null);
                    }}
                    hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                    style={{ position: "absolute", top: 12, right: 12 }}>
                    <Ionicons name="close-circle" size={20} color={"#c3c3c3"} />
                  </TouchableOpacity>
                </Check>
              </View>
            </View>
          );
        }}
      />
    );
  }
);
