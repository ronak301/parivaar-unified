import { useEffect, useState } from "react";
import { compareVersions } from "compare-versions";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useConfigManager } from "@/hooks/useConfigManager";
import { Check } from "@/components/ui/Check";

const WEB_APP_VERSION =
  import.meta.env.VITE_APP_VERSION ?? "1.0.0";

export function UpdateAvailable() {
  const { config } = useConfigManager({});
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const platform = "currentVersionAndroid" as const;
    const appMeta = config?.appMeta as
      | { currentVersionAndroid?: { version?: string } }
      | undefined;
    const metadata = appMeta?.[platform];
    const version = metadata?.version;
    if (
      version &&
      WEB_APP_VERSION &&
      compareVersions(WEB_APP_VERSION, version) < 0
    ) {
      setIsUpdateAvailable(true);
    }
  }, [config]);

  const onPress = () => {
    window.open("https://parivaarapp.in", "_blank", "noopener,noreferrer");
  };

  return (
    <Check ifPresent={isUpdateAvailable}>
      <div
        style={{
          width: "100%",
          height: 54,
          backgroundColor: "black",
          paddingLeft: 16,
          paddingRight: 16,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>New Version Available</Text>
        <Button style={{ height: 28, width: "auto" }} title="Update" onPress={onPress} />
      </div>
    </Check>
  );
}
