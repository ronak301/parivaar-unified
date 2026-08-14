import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { setCommunity } from "@/modules/directory/redux/communitySlice";
import type { RootState } from "@/store";
import type { Community } from "@/types/types";
import { useConfigManager } from "@/hooks/useConfigManager";
import { getNextScreen } from "@/modules/directory/utils/navigation";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type Props = {
  item: Community;
};

export function CommunityItem({ item }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const { getCommunityConfig } = useConfigManager({});

  const communityConfig = getCommunityConfig(item?.id ?? "");
  const nextPath = getNextScreen(communityConfig, item?.id);
  const logoUrl = resolveMediaUrl(item?.logo);

  return (
    <button
      type="button"
      onClick={() => {
        dispatch(
          setCommunity({
            ...(selectedCommunity?.id === item?.id ? selectedCommunity : {}),
            ...item,
          })
        );
        navigate(nextPath);
      }}
      style={{
        padding: "16px 8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        background: "white",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            objectFit: "cover",
            backgroundColor: themeColors.border,
          }}
        />
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            backgroundColor: themeColors.border,
            flexShrink: 0,
          }}
        />
      )}
      <div
        style={{
          flex: 1,
          paddingLeft: 8,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, marginRight: 8 }}>
          <Text bold style={{ fontSize: 16, fontWeight: 600, display: "block" }}>
            {item?.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: themeColors.textLight,
              paddingTop: 4,
              fontWeight: 400,
              display: "block",
            }}
          >
            {item?.description}
          </Text>
        </div>
        <span style={{ marginRight: 8, fontSize: 20 }} aria-hidden>
          ›
        </span>
      </div>
    </button>
  );
}
