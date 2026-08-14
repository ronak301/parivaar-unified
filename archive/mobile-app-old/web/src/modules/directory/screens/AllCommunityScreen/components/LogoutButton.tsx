import { useLogout } from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";

export function LogoutButton() {
  const { logout } = useLogout();

  return (
    <button
      type="button"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
      onClick={() => {
        if (window.confirm("Are you sure you want to logout?")) {
          logout();
        }
      }}
    >
      <Text style={{ color: "white", marginLeft: 8 }}>Logout</Text>
    </button>
  );
}
