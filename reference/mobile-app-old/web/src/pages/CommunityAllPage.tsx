import { UserCommunities } from "@/modules/directory/screens/AllCommunityScreen/components/UserCommunities";
import { LogoutButton } from "@/modules/directory/screens/AllCommunityScreen/components/LogoutButton";
import { themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { LAYOUT } from "@/theme/layout";

export function CommunityAllPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 12,
          paddingRight: 12,
          minHeight: LAYOUT.headerHeight,
          flexShrink: 0,
          boxShadow: "0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Parivaar App</Text>
        <LogoutButton />
      </header>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: themeColors.bluishBackground,
        }}
      >
        <UserCommunities />
      </div>
    </div>
  );
}
