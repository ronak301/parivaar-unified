import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";
import { Text } from "@/components/ui/Text";
import { themeColors } from "@/theme";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type Props = {
  size?: number;
  profilePicture?: string | { uri?: string } | unknown;
  name?: string;
  role?: string;
  id?: string;
  number?: string;
};

export default function MemberTile({
  size = 120,
  profilePicture,
  name,
  role,
  id = "",
  number = "",
}: Props) {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);
  const raw =
    typeof profilePicture === "string"
      ? profilePicture
      : (profilePicture as { uri?: string })?.uri;
  const src = resolveMediaUrl(raw);

  const avatar = Math.round(size * 0.62);

  const inner = (
    <>
      {src && !imgFailed ? (
        <img
          src={src}
          alt=""
          onError={() => setImgFailed(true)}
          style={{
            width: avatar,
            height: avatar,
            borderRadius: 999,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: avatar,
            height: avatar,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        />
      )}
      <Text bold style={{ color: "white", fontSize: 8, paddingTop: 12, textAlign: "center" }}>
        {name}
      </Text>
      <Text bold style={{ color: "white", fontSize: 8, paddingTop: 2, textAlign: "center" }}>
        {role}
      </Text>
      <Text bold style={{ color: "white", fontSize: 8, paddingTop: 2, textAlign: "center" }}>
        {number}
      </Text>
    </>
  );

  const boxStyle: React.CSSProperties = {
    width: size,
    alignItems: "center",
    padding: 8,
    backgroundColor: themeColors.darkBackground,
    borderRadius: 8,
    marginRight: 8,
    display: "flex",
    flexDirection: "column",
  };

  if (isEmpty(id)) {
    return <div style={boxStyle}>{inner}</div>;
  }

  return (
    <button
      type="button"
      style={{ ...boxStyle, border: "none", cursor: "pointer" }}
      onClick={() => navigate(`/member/${id}`)}
    >
      {inner}
    </button>
  );
}
