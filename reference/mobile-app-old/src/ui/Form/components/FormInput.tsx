import * as React from "react";
import {
  View,
  TextInput,
  TextStyle,
  TextInputProps,
  StyleProp,
  StyleSheet,
} from "react-native";
import {
  Controller,
  UseControllerProps,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import noop from "lodash/noop";

import { FormLabel } from "./FormLabel";
import { FormErrorMessage } from "./FormErrorMessage";
import { useTheme } from "src/ui/theme";
import { Text } from "src/ui/Text";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Check from "src/ui/Check";

type FormInputProps = TextInputProps & {
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
  onSubmit?: (val: string) => void;

  /**
   * If the form is submitting
   */
  isSubmitting?: boolean;

  /**
   * field rules
   */
  rules?: UseControllerProps["rules"];

  /**
   * If analytics should be disabled
   */
  analyticsDisabled?: boolean;

  /**
   *  optional children
   */
  children?: React.ReactNode;

  style?: StyleProp<TextStyle>;
};

export const FormInput = React.forwardRef((props: FormInputProps, ref) => {
  const methods = useFormContext() as UseFormReturn & {
    formName: string;
  };

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    input: {
      flex: 1,
      minHeight: 48,
      borderRadius: 8,
      backgroundColor: "#F6F8FB",
      paddingLeft: 12,
      paddingRight: 48,
      color: colors.textDark,
      borderWidth: 2,
      borderColor: colors.border,
    },
    focusedInput: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    invalid: {},
    disabled: {},
  });

  const [isFocused, setFocus] = React.useState(false);

  const {
    name,
    label,
    placeholder,
    rules = {},
    disabled = false,
    analyticsDisabled = false,
    onSubmit = noop,
    isSubmitting = false,
    children,
    style,
    keyboardType,
    editable = true,
    ...rest
  } = props;

  if (methods === null) {
    return <Text>Missing form context</Text>;
  }

  if (!methods.formName && !analyticsDisabled) {
    return <Text>Missing form name</Text>;
  }

  return (
    <Controller
      name={name}
      control={methods.control}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorMessage =
          fieldState.isDirty && rules?.required && !field.value?.length
            ? "This field is required"
            : fieldState.error?.message;

        const isInvalid =
          (fieldState.isDirty && !field.value?.length && !!rules?.required) ||
          !!fieldState.error;
        return (
          <View style={{ marginBottom: 12 }}>
            <FormLabel label={label} />
            <View
              style={[
                isInvalid ? styles.invalid : {},
                disabled ? styles.disabled : {},
                {
                  flexDirection: "row",
                  flex: 1,
                },
              ]}>
              {keyboardType === "phone-pad" ? (
                <View
                  style={[
                    {
                      width: 60,
                      height: 48,
                      backgroundColor: "#F6F8FB",
                      marginRight: 8,
                      flex: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: colors?.borderDark,
                      borderWidth: 1,
                      borderRadius: 8,
                    },
                  ]}>
                  <Text
                    bold
                    style={{
                      color: colors.textDark,
                      fontSize: 16,
                    }}>
                    +91
                  </Text>
                </View>
              ) : null}
              <TextInput
                editable={!disabled}
                style={[
                  styles.input,
                  isFocused ? styles?.focusedInput : {},
                  style,
                ]}
                placeholderTextColor={colors?.textLight}
                testID={`${methods.formName}-${name}`}
                placeholder={placeholder}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                onFocus={() => setFocus(true)}
                onEndEditing={() => setFocus(false)}
                keyboardType={keyboardType}
                {...rest}>
                {children}
              </TextInput>
              <Check ifPresent={field?.value && editable}>
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

            <FormErrorMessage error={errorMessage} />
          </View>
        );
      }}
    />
  );
});
