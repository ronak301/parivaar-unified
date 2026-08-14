import { capitalize } from "lodash";
import { useNavigate } from "react-router-dom";
import { getBusinessTypeDisplay, getCapitalizedName } from "@/utils/utils";
import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Check } from "@/components/ui/Check";
import type { Member } from "@/types/types";

const BG_COLOR = ["#ACF", "#FFD3C5", "#CCFFD4", "#FFD3F8"];

export default function BusinessItem({
  item,
  index,
}: {
  item: Member;
  index: number;
}) {
  const business = item?.business;
  const navigate = useNavigate();
  const bgColor = BG_COLOR[index % 4];

  return (
    <div
      style={{
        backgroundColor: bgColor,
        margin: "8px 16px",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Text bold style={{ fontSize: 20, color: "black", paddingTop: 4 }}>
        {capitalize(business?.name ?? "")}
      </Text>

      <Check ifPresent={business?.type}>
        <div style={{ marginTop: 4 }}>
          <span
            style={{
              backgroundColor: "white",
              padding: "4px 8px",
              borderRadius: 999,
              border: `2px solid ${BG_COLOR[0] === bgColor ? BG_COLOR[2] : BG_COLOR[0]}`,
              fontSize: 10,
              display: "inline-block",
            }}
          >
            {getBusinessTypeDisplay(business?.type)}
          </span>
        </div>
      </Check>

      <Check ifPresent={!!business?.description}>
        <Text style={{ paddingTop: 8, fontSize: 14, color: themeColors.textLight }}>
          {business?.description}
        </Text>
      </Check>

      <Check ifPresent={business?.website}>
        <a
          href={business?.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", paddingTop: 8, fontSize: 12, color: themeColors.link }}
        >
          {business?.website}
        </a>
      </Check>

      <button
        type="button"
        onClick={() => navigate(`/member/${item.id}`)}
        style={{
          marginTop: 12,
          background: "none",
          border: "none",
          color: themeColors.primary,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        {getCapitalizedName(item)} — View profile
      </button>
    </div>
  );
}
