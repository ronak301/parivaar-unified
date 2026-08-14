import isEmpty from "lodash/isEmpty";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "src/ui/Text";
import { useTheme } from "src/ui/theme";

interface Props {
  error?: string;
}

const MIN_HEIGHT = 0;

export function FormErrorMessage({ error }: Props) {
  const { colors } = useTheme();
  if (isEmpty(error))
    return (
      <View style={{ backgroundColor: "transparent", minHeight: MIN_HEIGHT }} />
    );

  const styles = StyleSheet.create({
    errorText: {
      color: colors?.red,
      paddingTop: 4,
      minHeight: MIN_HEIGHT,
      fontFamily: "poppins",
      fontSize: 10,
    },
  });
  return <Text style={styles.errorText}>{error}</Text>;
}
