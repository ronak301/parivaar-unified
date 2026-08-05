import { useState } from "react";
import { themeColors } from "@/theme";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type Props = {
  url?: string;
  initials?: [string | undefined, string | undefined];
  as?: "normal" | "executive" | "familymember";
  /** Override diameter in px (list vs profile). */
  size?: number;
};

function MemberImage({ url, initials, as, size: sizeProp }: Props) {
  const [broken, setBroken] = useState(false);

  const ring =
    as === "executive"
      ? "2px solid gold"
      : as === "familymember"
        ? `2px solid ${themeColors.teal}`
        : "none";

  const size =
    sizeProp ??
    (as === "familymember" ? 48 : 56);

  const label = `${initials?.[0]?.[0] ?? ""}${initials?.[1]?.[0] ?? ""}`.trim();
  const resolved = resolveMediaUrl(url);
  const showImg = Boolean(resolved && !broken);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: themeColors.border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: ring,
      }}
    >
      {showImg ? (
        <img
          src={resolved}
          alt=""
          onError={() => setBroken(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            fontSize: Math.max(12, Math.round(size * 0.28)),
            fontWeight: 600,
            color: themeColors.textLight,
          }}
        >
          {label || "?"}
        </span>
      )}
    </div>
  );
}

export default MemberImage;
