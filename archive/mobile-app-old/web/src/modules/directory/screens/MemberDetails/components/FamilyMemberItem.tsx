import MemberItem from "@/modules/directory/components/MemberItem";
import type { Relative } from "@/types/types";

export default function FamilyMemberItem({ relative }: { relative: Relative }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <MemberItem
        member={relative}
        as="familymember"
        showSeperator={false}
        style={{
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 12,
        }}
      />
    </div>
  );
}
