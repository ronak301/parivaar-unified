import { themeColors } from "@/theme";
import { Text } from "./Text";
import { LAYOUT } from "@/theme/layout";

/** Full-viewport loading state (fills the mobile shell column when inside `MobileShell`). */
export function LoadingComponent() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: LAYOUT.shellMaxWidth,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        minHeight: "100dvh",
        boxSizing: "border-box",
        backgroundColor: themeColors.bluishBackground,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid #ccc",
          borderTopColor: "black",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <Text style={{ marginTop: 8 }}>Loading...</Text>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
