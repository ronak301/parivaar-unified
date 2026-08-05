import { useEffect, useState } from "react";
import { matchPath, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCommunityDetailsForId } from "@/api/directoryApi";
import { setCommunity } from "@/modules/directory/redux/communitySlice";
import type { RootState } from "@/store";
import DirectoryScreen from "@/modules/directory/screens/DirectoryScreen";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { CommunityDirectoryHeader } from "@/components/layout/CommunityDirectoryHeader";
import { unwrapApiBody } from "@/utils/unwrapApiBody";
import { Flex } from "@chakra-ui/react";

export default function DirectoryPage() {
  const { id: routeCommunityId } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selected = useSelector((s: RootState) => s.community.selectedCommunity);
  const [loading, setLoading] = useState(false);

  /** URL param when on `/community/:id`, else last selected community (tab stays mounted on Business/Profile). */
  const id = routeCommunityId ?? selected?.id;

  const isDirectoryUrl = Boolean(
    matchPath({ path: "/community/:id", end: true }, location.pathname)
  );

  useEffect(() => {
    if (!id) {
      if (isDirectoryUrl) {
        navigate("/community/all", { replace: true });
      }
      return;
    }

    const applyPayload = (payload: unknown) => {
      const flat = unwrapApiBody(payload as Record<string, unknown>);
      if (flat && Object.keys(flat).length > 0) {
        dispatch(setCommunity({ ...flat, id }));
      }
    };

    if (selected?.id === id) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getCommunityDetailsForId(id);
        if (!cancelled) applyPayload(res.data as unknown);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, selected?.id, dispatch, navigate, isDirectoryUrl]);

  if (loading && selected?.id !== id) {
    return <LoadingComponent />;
  }

  return (
    <Flex direction="column" flex={1} minH={0} overflow="hidden" bg="gray.50">
      <CommunityDirectoryHeader />
      <Flex flex={1} minH={0} direction="column" overflow="hidden">
        <DirectoryScreen />
      </Flex>
    </Flex>
  );
}
