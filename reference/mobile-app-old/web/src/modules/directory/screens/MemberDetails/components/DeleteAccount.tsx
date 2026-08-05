import { useApi } from "@/api/useApi";
import { deleteUser } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useProfileExtraInfo } from "@/modules/profile/utils";
import { setShouldReloadSearchResults } from "@/modules/directory/screens/SearchScreen/redux/searchSlice";
import { useLogout } from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";
import { themeColors } from "@/theme";
import type { Member } from "@/types/types";

export default function DeleteAccount({ memberDetails }: { memberDetails: Member }) {
  const { request: deleteAccountApi } = useApi(deleteUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSelfProfile } = useProfileExtraInfo(memberDetails);
  const { logout } = useLogout();

  return (
    <button
      type="button"
      onClick={async () => {
        if (
          !window.confirm(
            "Are you sure you want to permanently delete Account?\nThis will delete all of the data associated with this account"
          )
        )
          return;
        await deleteAccountApi(memberDetails?.id);
        if (isSelfProfile) {
          logout();
        } else {
          dispatch(setShouldReloadSearchResults(true));
          navigate(-1);
        }
      }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        border: "none",
        borderBottom: "none",
        background: "white",
        cursor: "pointer",
      }}
    >
      <Text style={{ color: themeColors.red, fontWeight: 600 }}>Delete account</Text>
      <Text style={{ color: themeColors.textLight, fontSize: 12, display: "block", marginTop: 4 }}>
        This action cannot be undone.
      </Text>
    </button>
  );
}
