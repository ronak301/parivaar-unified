import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import GenericProfileScreen from "@/modules/profile/GenericProfileScreen";
import { BlackTitleHeader } from "@/components/layout/BlackTitleHeader";

export default function ProfileTabPage() {
  const currentUser = useSelector((s: RootState) => s.auth.currentUser);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <BlackTitleHeader title="Profile" />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "rgb(231, 240, 244)",
        }}
      >
        <GenericProfileScreen id={currentUser?.id} />
      </div>
    </div>
  );
}
