import type { CSSProperties, ReactNode } from "react";

export default function Box({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        marginTop: 8,
        marginBottom: 8,
        paddingTop: 8,
        paddingBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
