import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";

export function DesktopUnsupported() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: themeColors.bluishBackground,
        textAlign: "center",
      }}
    >
      <Text bold style={{ fontSize: 22, marginBottom: 16 }}>
        Parivaar is not available on desktop
      </Text>
      <Text style={{ fontSize: 16, color: themeColors.textLight, maxWidth: 420 }}>
        Please open this site on your phone or tablet. The experience is designed
        for mobile browsers only.
      </Text>
    </div>
  );
}
