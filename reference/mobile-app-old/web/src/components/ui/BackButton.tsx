import { useNavigate } from "react-router-dom";
import { themeColors } from "@/theme";
import { IconChevronLeft } from "@/components/ui/NavIcons";
import { LAYOUT } from "@/theme/layout";

type Props = {
  appearance?: "light" | "dark";
};

export function BackButton({ appearance = "dark" }: Props) {
  const navigate = useNavigate();
  const color = appearance === "light" ? "#fff" : themeColors.textDark;
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      style={{
        background: "none",
        border: "none",
        color,
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: LAYOUT.tapMin,
        height: LAYOUT.tapMin,
        flexShrink: 0,
      }}
      aria-label="Back"
    >
      <IconChevronLeft size={LAYOUT.iconMd} color={color} />
    </button>
  );
}
