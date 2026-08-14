import * as React from "react";
import { Text } from "src/ui/Text";
import { isEmpty } from "lodash";
import { useTheme } from "src/ui/theme";

interface Props {
  label?: string;
}

export function FormLabel({ label }: Props) {
  const { colors } = useTheme();
  if (isEmpty(label)) return null;

  return (
    <Text
      style={{
        color: "#728197",
        marginBottom: 8,
        fontSize: 12,
        fontWeight: "500",
        paddingTop: 2,
      }}>
      {label}
    </Text>
  );
}
