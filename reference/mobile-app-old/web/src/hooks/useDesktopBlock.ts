import { useEffect, useState } from "react";

/** Viewport wider than this shows “desktop not supported” (mobile web only). */
const DESKTOP_MIN_WIDTH_PX = 900;

export function useIsDesktopViewportBlocked() {
  const [blocked, setBlocked] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth > DESKTOP_MIN_WIDTH_PX
      : false
  );

  useEffect(() => {
    const onResize = () => {
      setBlocked(window.innerWidth > DESKTOP_MIN_WIDTH_PX);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return blocked;
}
