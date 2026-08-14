import { Text } from "./Text";
import { themeColors } from "@/theme";

type Props = {
  title?: string;
  subtitle?: string;
};

export function NoDataComponent({
  title = "No Data",
  subtitle = "Nothing to show here yet.",
}: Props) {
  return (
    <div
      style={{
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        minHeight: 120,
      }}
    >
      <Text bold style={{ fontSize: 16, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ color: themeColors.textLight, textAlign: "center" }}>
        {subtitle}
      </Text>
    </div>
  );
}
