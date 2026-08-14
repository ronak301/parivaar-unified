import type { ReactNode } from "react";
import { LAYOUT } from "@/theme/layout";

type Props = {
  children: ReactNode;
};

/** Centers content in a phone-sized column (matches native narrow layout). */
export function MobileShell({ children }: Props) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "white",
        maxWidth: LAYOUT.shellMaxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
