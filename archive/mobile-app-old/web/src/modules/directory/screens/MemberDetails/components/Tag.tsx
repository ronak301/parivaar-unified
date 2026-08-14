import { themeColors } from "@/theme";

export default function Tag({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: "4px 4px",
        marginLeft: 4,
        backgroundColor: themeColors.lightGreen,
        paddingLeft: 4,
        paddingRight: 4,
        border: `1px solid ${themeColors.green}`,
        borderRadius: 4,
        fontSize: 7,
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}
