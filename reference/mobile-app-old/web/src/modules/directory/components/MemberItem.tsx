import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { Executive, Member, Relative } from "@/types/types";
import { setMemberCache } from "@/modules/profile/redux/profileSlice";
import {
  filterAndGetFirstRole,
  getBloodGroupDisplay,
  getBusinessTypeDisplay,
  getCapitalizedName,
} from "@/utils/utils";
import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import MemberImage from "@/components/ui/MemberImage";
import { pickMemberAvatarUrl } from "@/utils/resolveMediaUrl";
import { Check } from "@/components/ui/Check";
import MemberExtraInfo from "./MemberExtraInfo";

type Props = {
  member: Member | Executive | Relative;
  as?: "normal" | "executive" | "familymember";
  showSeperator?: boolean;
  style?: React.CSSProperties;
  onPress?: () => void;
};

function IconBloodDrop({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5S7 9 7 13.5a5 5 0 1 0 10 0C17 9 12 2.5 12 2.5z" />
    </svg>
  );
}

function Separator() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: themeColors.border,
        marginLeft: 76,
      }}
    />
  );
}

export default function MemberItem({
  member,
  as = "normal",
  showSeperator = true,
  style,
  onPress,
}: Props) {
  const isExecutive = as === "executive";
  const isFamilyMember = as === "familymember";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const occupation =
    member?.business?.name ||
    getBusinessTypeDisplay(member?.business?.type) ||
    member?.education;

  const shouldShowBloodGroup = !!(member?.bloodGroup && !isFamilyMember);
  const shouldShowOccupation = !!occupation && !isFamilyMember;

  const handleClick = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (member?.id) {
      dispatch(setMemberCache({ id: member.id, member: member as Member }));
    }
    navigate(`/member/${member?.id}`);
  };

  return (
    <div style={{ flex: 1 }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          backgroundColor: "white",
          padding: "10px 12px",
          margin: "3px 8px",
          borderRadius: 16,
          paddingLeft: 12,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minHeight: 76,
          border: "none",
          width: "calc(100% - 16px)",
          cursor: "pointer",
          textAlign: "left",
          ...style,
        }}
      >
        <MemberImage
          url={pickMemberAvatarUrl(member)}
          initials={[member?.firstName, member?.lastName]}
          as={as}
        />
        <div
          style={{
            paddingLeft: 12,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              bold
              style={{
                flex: 1,
                fontSize: 16,
                color: themeColors.textDark,
              }}
            >
              {getCapitalizedName(member)}
            </Text>
            <MemberExtraInfo member={member} isFamilyMember={isFamilyMember} />
          </div>
          {member?.phone && !isFamilyMember ? (
            <Text
              style={{
                fontSize: isExecutive ? 12 : 14,
                color: themeColors.textLight,
                fontWeight: 500,
                marginBottom: isExecutive ? 4 : 0,
              }}
            >
              {member.phone}
            </Text>
          ) : null}
          {!isFamilyMember ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 2,
                minHeight: 20,
              }}
            >
              {isExecutive ? (
                <span
                  style={{
                    backgroundColor: "#1a81ff",
                    padding: "0 8px",
                    borderRadius: 999,
                    height: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {filterAndGetFirstRole(
                    (member as Executive)?.executive?.roles ?? []
                  ) ?? ""}
                </span>
              ) : shouldShowOccupation ? (
                <Text
                  style={{
                    fontSize: 12,
                    flex: 1,
                    marginRight: 8,
                    color: themeColors.textLight,
                    fontWeight: 500,
                    paddingTop: 2,
                  }}
                >
                  {occupation}
                </Text>
              ) : (
                <div />
              )}
              {shouldShowBloodGroup ? (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 999,
                    backgroundColor: themeColors.lightRed,
                    border: `1px solid ${themeColors.red}`,
                    color: themeColors.red,
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <IconBloodDrop size={14} />
                  {getBloodGroupDisplay(member?.bloodGroup)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </button>
      <Check ifPresent={showSeperator}>
        <Separator />
      </Check>
    </div>
  );
}
