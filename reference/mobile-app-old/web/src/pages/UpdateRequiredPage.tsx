import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

const SITE_URL = "https://parivaarapp.in";

export function UpdateRequiredPage() {
  return (
    <div
      style={{
        backgroundColor: "white",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Text bold style={{ textAlign: "center", paddingBottom: 32, fontSize: 22 }}>
        Update required!
      </Text>
      <Text style={{ paddingBottom: 32, textAlign: "center", maxWidth: 400 }}>
        This version of Parivaar is out of date. Please reload after we publish a
        new build, or visit the site for the latest information.
      </Text>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Button
          title="Open parivaarapp.in"
          onPress={() => {
            window.open(SITE_URL, "_blank", "noopener,noreferrer");
          }}
        />
      </div>
    </div>
  );
}
