import { Text } from "./Text";
import { themeColors } from "@/theme";

type Props = {
  title: string;
  onPress?: () => void;
  isNew?: boolean;
  size?: number;
};

export default function TitleRow({ title, onPress, isNew, size = 16 }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        background: "rgb(215,215,210)",
        border: "none",
        cursor: onPress ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <Text bold style={{ fontSize: size }}>
        {title}
      </Text>
      {isNew ? (
        <span
          style={{
            backgroundColor: themeColors.red,
            color: "white",
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          NEW
        </span>
      ) : null}
    </button>
  );
}
