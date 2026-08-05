import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { filter } from "lodash";
import { GeetMalaSongs } from "@/utils/geetmala";
import { themeColors } from "@/theme";
import { Check } from "@/components/ui/Check";
import { Text } from "@/components/ui/Text";

export default function GeetmalaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<(typeof GeetMalaSongs)[0] | undefined>();

  useEffect(() => {
    setSong(filter(GeetMalaSongs, (s) => s?.id === Number(id))?.[0]);
  }, [id]);

  return (
    <div style={{ padding: "16px 12px 64px", whiteSpace: "pre-wrap" }}>
      <Check ifPresent={song?.author || song?.similarto}>
        <div
          style={{
            padding: "10px 20px",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: themeColors.green,
            borderRadius: 16,
            marginBottom: 16,
            backgroundColor: themeColors.lightGreen,
          }}
        >
          {song?.author ? (
            <Text bold>{`रचियता - ${song.author}`}</Text>
          ) : null}
          {song?.similarto ? <Text>{`लय - ${song.similarto}`}</Text> : null}
        </div>
      </Check>
      <Text style={{ fontSize: 18, lineHeight: 24 }}>{song?.desc}</Text>
    </div>
  );
}
