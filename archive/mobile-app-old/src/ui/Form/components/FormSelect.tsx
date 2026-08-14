import * as React from "react";
import {
  View,
  TextInput,
  TextStyle,
  TextInputProps,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { filter, isEmpty, map } from "lodash";
import Check from "src/ui/Check";
import FlatList from "src/ui/FlatList";
import SeperatorComponent from "src/ui/SeperatorComponent";

type Item = {
  id?: string;
  label?: string;
};

type FormSelectProps = TextInputProps & {
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
   *  optional children
   */
  children?: React.ReactNode;

  style?: StyleProp<TextStyle>;

  searchable?: boolean;

  items: Item[];
};

export const FormSelect = React.forwardRef((props: FormSelectProps, ref) => {
  const methods = useFormContext() as UseFormReturn & {
    formName: string;
  };

  const [showModal, setShowModal] = React.useState(false);
  const [text, setText] = React.useState("");

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    input: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: colors.textDark,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#F6F8FB",
      justifyContent: "center",
    },
    focusedInput: {},
    invalid: {},
    disabled: {},
  });

  const {
    name,
    label,
    value,
    placeholder,
    rules = {},
    searchable = true,
    disabled = false,
    onSubmit = noop,
    isSubmitting = false,
    children,
    style,
    keyboardType,
    items,
    ...rest
  } = props;

  const [searchedItems, setItems] = React.useState(items);

  React.useEffect(() => {
    if (text === "") {
      setItems(items);
    } else {
      const newItems = filter(searchedItems, (item) => {
        return !!item?.label?.includes(text);
      });
      setItems(newItems);
    }
  }, [text]);

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
        const errorMessage =
          fieldState.isDirty && rules?.required && !field.value?.length
            ? "This field is required"
            : fieldState.error?.message;

        const isInvalid =
          (fieldState.isDirty && !field.value?.length && !!rules?.required) ||
          !!fieldState.error;
        return (
          <View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showModal}
              style={{ height: 100 }}
              onRequestClose={() => {
                setShowModal(false);
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={1}
                onPressOut={() => {
                  setShowModal(false);
                }}>
                <FlatList
                  style={{
                    top: 80,
                    marginBottom: 220,
                    width: "90%",
                    backgroundColor: "white",
                    borderRadius: 16,
                  }}
                  ListHeaderComponent={
                    <Text
                      bold
                      style={{
                        marginTop: 32,
                        paddingLeft: 16,
                        fontSize: 22,
                        paddingBottom: 16,
                      }}>
                      {placeholder}
                    </Text>
                  }
                  ListEmptyComponent={
                    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                      <Text style={{ fontFamily: "poppins", color: "black" }}>
                        No Data
                      </Text>
                    </View>
                  }
                  data={searchedItems}
                  renderItem={({ item }) => {
                    const selected = field?.value === item?.id;
                    return (
                      <TouchableOpacity
                        key={item?.id}
                        style={{
                          paddingVertical: 16,
                          paddingHorizontal: 16,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          borderBottomColor: colors.border,
                          borderBottomWidth: 1,
                        }}
                        onPress={() => {
                          setShowModal(false);
                          field.onChange(item?.id);
                        }}>
                        <Text style={{ fontFamily: "poppins", paddingTop: 4 }}>
                          {item.label}
                        </Text>
                        {selected ? (
                          <Ionicons
                            name="checkmark-done"
                            size={18}
                            color={colors.green}
                          />
                        ) : (
                          <View />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </TouchableOpacity>
            </Modal>
            <View
              style={{
                marginBottom: 8,
              }}>
              <FormLabel label={label} />
              <View
                style={[
                  isInvalid ? styles.invalid : {},
                  disabled ? styles.disabled : {},
                  {
                    flex: 1,
                  },
                ]}>
                <TouchableOpacity
                  onPress={() => {
                    setText("");
                    setShowModal(true);
                  }}>
                  <View style={[styles.input, style]}>
                    <Text
                      style={
                        !field.value
                          ? { color: "rgb(100,100,100)", fontSize: 16 }
                          : {}
                      }>
                      {value || placeholder}
                    </Text>
                  </View>

                  <View style={{ position: "absolute", top: 16, right: 12 }}>
                    <Ionicons name={"chevron-down"} size={16} color={"black"} />
                  </View>
                </TouchableOpacity>

                <Check ifPresent={field?.value}>
                  <View style={{ zIndex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        field.onChange(null);
                      }}
                      hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                      style={{ position: "absolute", top: -34, right: 32 }}>
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={"#c3c3c3"}
                      />
                    </TouchableOpacity>
                  </View>
                </Check>
              </View>

              <FormErrorMessage error={errorMessage} />
            </View>
          </View>
        );
      }}
    />
  );
});
