import { Text } from "@/components/ui/Text";
import { getFamilyRelationTypeDisplay } from "@/utils/utils";
import type { Executive, Member, Relative } from "@/types/types";
import { MemberRowContactIcons } from "@/components/ui/ContactActionIcons";

function SimpleTag({ text }: { text: string | undefined }) {
  if (!text) return null;
  return (
    <div
      style={{
        backgroundColor: "#E8F2FF",
        padding: "4px 8px",
        borderRadius: 999,
        marginBottom: 4,
        display: "inline-block",
      }}
    >
      <Text bold style={{ fontWeight: 500, fontSize: 10 }}>
        {text}
      </Text>
    </div>
  );
}

export default function MemberExtraInfo({
  member,
  isFamilyMember,
}: {
  member: Member | Executive | Relative;
  isFamilyMember?: boolean;
}) {
  if (isFamilyMember) {
    const rel = (member as Relative).relationship?.type;
    return <SimpleTag text={getFamilyRelationTypeDisplay(rel)} />;
  }
  if (member?.phone) {
    return <MemberRowContactIcons phone={member.phone} />;
  }
  return null;
}
