import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

/** Search is embedded on the community directory; keep route for bookmarks and redirect here. */
export default function SearchScreen() {
  const navigate = useNavigate();
  const communityId = useSelector((s: RootState) => s.community.selectedCommunity?.id);

  useEffect(() => {
    if (communityId) {
      navigate(`/community/${communityId}`, { replace: true });
    } else {
      navigate("/community/all", { replace: true });
    }
  }, [communityId, navigate]);

  return null;
}
