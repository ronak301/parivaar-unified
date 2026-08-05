import { Text } from "./Text";
import { themeColors } from "@/theme";

export function ErrorComponent() {
  return (
    <div style={{ padding: 32 }}>
      <Text style={{ color: themeColors.red }}>Something went wrong. Please try again.</Text>
    </div>
  );
}
