import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";
import { LAYOUT } from "@/theme/layout";

export function BlackTitleHeader({
  title,
  leftAction,
  rightAction,
}: {
  title: string;
  /** When set, replaces the left spacer (e.g. back button). */
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "#000",
        color: "#fff",
        minHeight: LAYOUT.headerHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 12,
        paddingRight: 12,
        flexShrink: 0,
        boxShadow: "0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          {leftAction ?? <span style={{ width: 40 }} aria-hidden />}
        </div>
        <Text
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            flex: 1,
            textAlign: "center",
            minWidth: 0,
          }}
        >
          {title}
        </Text>
        <div style={{ width: 40, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          {rightAction}
        </div>
      </div>
    </header>
  );
}
