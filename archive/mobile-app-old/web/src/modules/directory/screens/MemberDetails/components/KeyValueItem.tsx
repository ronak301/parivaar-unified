import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";
import { themeColors } from "@/theme";

type Props = {
  displayName: string;
  value?: string;
  icon?: ReactNode;
};

export default function KeyValueItem({ displayName, value, icon }: Props) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        paddingTop: 14,
        paddingBottom: 14,
        borderBottom: `1px solid ${themeColors.border}`,
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 28,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 2,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <Text style={{ fontSize: 12, color: themeColors.textLight, lineHeight: 1.3 }}>
          {displayName}
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 1.45, wordBreak: "break-word" }}>{value}</Text>
      </div>
    </div>
  );
}
