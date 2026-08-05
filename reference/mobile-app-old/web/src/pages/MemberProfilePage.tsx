import { useParams } from "react-router-dom";
import GenericProfileScreen from "@/modules/profile/GenericProfileScreen";
import { BlackTitleHeader } from "@/components/layout/BlackTitleHeader";
import { BackButton } from "@/components/ui/BackButton";

export default function MemberProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
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
      <BlackTitleHeader title="Profile" leftAction={<BackButton appearance="light" />} />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "rgb(231, 240, 244)",
          paddingBottom: 24,
        }}
      >
        <GenericProfileScreen id={memberId} />
      </div>
    </div>
  );
}
