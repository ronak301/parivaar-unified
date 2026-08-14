import { matchPath, Outlet, useLocation } from "react-router-dom";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { PersistentTabPanels } from "@/components/layout/PersistentTabPanels";
import { LAYOUT } from "@/theme/layout";

/**
 * Tab chrome + persistent Home / Business / Profile (see `PersistentTabPanels`).
 * Member profile is a child route rendered in an overlay so the tab tree stays mounted.
 */
export function TabShell() {
  const location = useLocation();
  const memberMatch = matchPath(
    { path: "/member/:memberId", end: true },
    location.pathname
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        paddingBottom: memberMatch
          ? 0
          : `calc(${LAYOUT.bottomTabHeight}px + max(8px, env(safe-area-inset-bottom, 0px)))`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: memberMatch ? "none" : "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          aria-hidden={Boolean(memberMatch)}
        >
          <PersistentTabPanels />
        </div>
        {memberMatch ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Outlet />
          </div>
        ) : null}
      </div>
      {memberMatch ? null : <BottomTabs />}
    </div>
  );
}
