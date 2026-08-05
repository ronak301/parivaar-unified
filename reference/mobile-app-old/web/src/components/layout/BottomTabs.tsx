import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { IconBriefcase, IconHome, IconUser } from "@/components/ui/TabBarIcons";
import { LAYOUT } from "@/theme/layout";

const ICON_SIZE = LAYOUT.iconMd;

export function BottomTabs() {
  const selected = useSelector((s: RootState) => s.community.selectedCommunity);
  const homeTo = selected?.id ? `/community/${selected.id}` : "/community/all";

  const tab = (to: string, label: string, Icon: typeof IconHome) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        flex: 1,
        textAlign: "center",
        padding: "6px 4px",
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))",
        color: isActive ? "#fff" : "rgb(160,160,160)",
        textDecoration: "none",
        fontSize: 10,
        fontWeight: 600,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        lineHeight: 1.2,
      })}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: ICON_SIZE,
          width: ICON_SIZE,
        }}
      >
        <Icon size={ICON_SIZE} />
      </span>
      {label}
    </NavLink>
  );

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: LAYOUT.shellMaxWidth,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "row",
        zIndex: 100,
        borderTop: "1px solid #222",
        minHeight: LAYOUT.bottomTabHeight,
        boxSizing: "border-box",
      }}
    >
      {tab(homeTo, "Home", IconHome)}
      {tab("/business", "Business", IconBriefcase)}
      {tab("/profile", "Profile", IconUser)}
    </nav>
  );
}
