import type { CSSProperties, ReactNode } from "react";
import { themeColors } from "@/theme";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  bold?: boolean;
  className?: string;
  onClick?: () => void;
};

export function Text({ children, style, bold, className, onClick }: Props) {
  return (
    <span
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{
        color: themeColors.textDark,
        fontFamily: bold
          ? '"Poppins", system-ui, sans-serif'
          : '"Poppins", system-ui, sans-serif',
        fontWeight: bold ? 600 : 400,
        letterSpacing: 0.24,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
