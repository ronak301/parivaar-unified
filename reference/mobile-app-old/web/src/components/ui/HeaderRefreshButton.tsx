/** Refresh control for tab headers (members / business / profile). */
export function HeaderRefreshButton({
  onClick,
  disabled,
  label = "Refresh",
  appearance = "dark",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  /** `dark` = light text on dark header; `light` = dark text on white surfaces */
  appearance?: "dark" | "light";
}) {
  const isDark = appearance === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        background: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.07)",
        border: "none",
        borderRadius: 10,
        color: isDark ? "#fff" : "#111",
        minWidth: 44,
        minHeight: 44,
        padding: "8px 12px",
        cursor: disabled ? "default" : "pointer",
        fontSize: 22,
        lineHeight: 1,
        fontWeight: 600,
        opacity: disabled ? 0.45 : 1,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      ↻
    </button>
  );
}
