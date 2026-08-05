import type { CSSProperties } from "react";
import { themeColors } from "@/theme";
import { Text } from "./Text";

type Props = {
  title?: string;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  style?: CSSProperties;
  size?: "md" | "lg";
};

export function Button({
  loading,
  title,
  onPress,
  disabled,
  variant = "solid",
  style,
  size = "lg",
}: Props) {
  const isOutline = variant === "outline";
  const bgColor = isOutline ? "white" : themeColors.primary;
  const textColor = isOutline ? themeColors.primary : "white";
  const borderColor = themeColors.primary;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onPress}
      style={{
        opacity: disabled ? 0.6 : 1,
        height: size === "lg" ? 48 : 36,
        backgroundColor: bgColor,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        paddingLeft: 16,
        paddingRight: 16,
        width: "100%",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {loading ? (
        <span style={{ color: textColor }}>…</span>
      ) : (
        <Text style={{ color: textColor, fontSize: size === "lg" ? 14 : 12 }}>
          {title}
        </Text>
      )}
    </button>
  );
}
