import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";

export function Footer() {
  return (
    <div style={{ marginTop: 16 }}>
      <Text style={{ textAlign: "center", marginBottom: "10%", paddingTop: 8 }}>
        Made with ❤️ in India 🇮🇳
      </Text>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignSelf: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() =>
            window.open("https://parivaarapp.in/terms", "_blank", "noopener,noreferrer")
          }
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: themeColors.primary,
            fontFamily: "inherit",
          }}
        >
          Terms & Conditions
        </button>
        <Text style={{ textAlign: "center", fontSize: 12 }}> and </Text>
        <button
          type="button"
          onClick={() =>
            window.open("https://parivaarapp.in/privacy", "_blank", "noopener,noreferrer")
          }
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: themeColors.primary,
            fontFamily: "inherit",
          }}
        >
          Privacy Policy
        </button>
      </div>
    </div>
  );
}
