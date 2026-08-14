import type { CSSProperties } from "react";
import { matchPath, useLocation } from "react-router-dom";
import DirectoryPage from "@/pages/DirectoryPage";
import BusinessTabPage from "@/pages/BusinessTabPage";
import ProfileTabPage from "@/pages/ProfileTabPage";

const panelShell: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

/**
 * Keeps Home / Business / Profile mounted so switching tabs does not remount screens
 * (state, scroll, list cache stay warm). Only one panel is visible at a time.
 */
export function PersistentTabPanels() {
  const location = useLocation();
  const path = location.pathname;

  const dirMatch = matchPath({ path: "/community/:id", end: true }, path);
  const dirId = dirMatch?.params?.id;
  const showDirectory = Boolean(dirId && dirId !== "all");

  const showBusiness = Boolean(matchPath({ path: "/business", end: true }, path));
  const showProfile = Boolean(matchPath({ path: "/profile", end: true }, path));

  return (
    <>
      <div
        style={{
          ...panelShell,
          display: showDirectory ? "flex" : "none",
        }}
        hidden={!showDirectory}
        aria-hidden={!showDirectory}
      >
        <DirectoryPage />
      </div>
      <div
        style={{
          ...panelShell,
          display: showBusiness ? "flex" : "none",
        }}
        hidden={!showBusiness}
        aria-hidden={!showBusiness}
      >
        <BusinessTabPage />
      </div>
      <div
        style={{
          ...panelShell,
          display: showProfile ? "flex" : "none",
        }}
        hidden={!showProfile}
        aria-hidden={!showProfile}
      >
        <ProfileTabPage />
      </div>
    </>
  );
}
