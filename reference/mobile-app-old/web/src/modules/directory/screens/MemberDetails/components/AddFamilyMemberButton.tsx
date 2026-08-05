import { useNavigate } from "react-router-dom";
import { Check } from "@/components/ui/Check";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types/types";

export default function AddFamilyMemberButton({
  showAddFamilyMemberButton,
  memberDetails,
}: {
  showAddFamilyMemberButton: boolean;
  memberDetails: Member;
}) {
  const navigate = useNavigate();
  return (
    <Check ifPresent={showAddFamilyMemberButton}>
      <div
        style={{
          width: "100%",
          paddingLeft: 16,
          paddingRight: 16,
          boxSizing: "border-box",
          marginTop: 12,
          marginBottom: 4,
        }}
      >
        <Button
          onPress={() => {
            if (
              window.confirm(
                `Adding Family Member?\nYou are adding family member of ${memberDetails?.firstName} Ji`
              )
            ) {
              navigate(`/add-family-member?user=${encodeURIComponent(JSON.stringify(memberDetails))}`);
            }
          }}
          title="Add Family Member"
          variant="outline"
          style={{
            width: "100%",
            height: 44,
            maxWidth: "100%",
          }}
        />
      </div>
    </Check>
  );
}
