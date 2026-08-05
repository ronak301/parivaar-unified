import * as React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Controller,
  UseControllerProps,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { FormLabel } from "../FormLabel";
import { useTheme } from "src/ui/theme";
import { Text } from "src/ui/Text";
import moment from "moment";
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

    const { colors } = useTheme();

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
        render={({ field, fieldState }) => {
          const onChange = (event, selectedDate) => {
            field.onChange(moment(selectedDate)?.format("yyyy-MM-DD"));
          };

          const openDatePicker = () => {
            DateTimePickerAndroid.open({
              value: new Date(field?.value),
              onChange,
              mode: "date",
            });
          };

          const emptyDate =
            field?.value === "1970-01-01" ||
            field?.value === null ||
            field?.value === undefined;

          return (
            <View style={{ marginBottom: 8 }}>
              <FormLabel label={label} />
              <View>
                <TouchableOpacity
                  onPress={openDatePicker}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: "#F6F8FB",
                    justifyContent: "center",
                  }}>
                  <Text>
                    {emptyDate
                      ? "Select Date"
                      : moment(field?.value)?.format("DD-MMM-yyyy")}
                  </Text>
                </TouchableOpacity>
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
