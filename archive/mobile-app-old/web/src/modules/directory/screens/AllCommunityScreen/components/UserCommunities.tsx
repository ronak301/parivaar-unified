import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { getUserCommunities } from "@/api/directoryApi";
import { useApi } from "@/api/useApi";
import type { RootState } from "@/store";
import { setAllCommunities } from "@/modules/directory/redux/communitySlice";
import { Text } from "@/components/ui/Text";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { CommunityItem } from "./CommunityItem";
import { UpdateAvailable } from "./UpdateAvailable";
import type { AxiosResponse } from "axios";
import type { Community } from "@/types/types";
import { unwrapApiBody } from "@/utils/unwrapApiBody";

/** Supports multiple response shapes from `GET user/communities/:id`. */
function extractCommunities(body: unknown): Community[] {
  const root = unwrapApiBody((body ?? {}) as Record<string, unknown>);
  let list: Community[] = [];

  if (Array.isArray(root.communities)) {
    list = root.communities as Community[];
  } else if (body == null || typeof body !== "object") {
    return [];
  } else {
    const b = body as Record<string, unknown>;
    if (Array.isArray(b.communities)) list = b.communities as Community[];
    else {
      const d = b.data as Record<string, unknown> | undefined;
      if (d && Array.isArray(d.communities)) list = d.communities as Community[];
      else {
        const nested = d?.data as Record<string, unknown> | undefined;
        if (nested && Array.isArray(nested.communities)) list = nested.communities as Community[];
      }
    }
  }

  return list.map((item) => unwrapApiBody(item as Record<string, unknown>) as Community);
}

function Separator() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: "rgb(245,245,249)",
        marginLeft: 16,
      }}
    />
  );
}

export function UserCommunities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allCommunities = useSelector(
    (state: RootState) => state?.community?.allCommunities
  );
  const currentUser = useSelector((state: RootState) => state?.auth?.currentUser);

  const { request: fetchUsercommunities } = useApi(getUserCommunities);
  const [fetchFinished, setFetchFinished] = useState(false);

  const currentSelectedCommunity = useSelector(
    (state: RootState) => state.community.selectedCommunity
  );

  useEffect(() => {
    if (currentSelectedCommunity?.id) {
      navigate(`/community/${currentSelectedCommunity.id}`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!currentUser?.id) {
        setFetchFinished(true);
        return;
      }
      try {
        const res = (await fetchUsercommunities(
          currentUser.id
        )) as AxiosResponse<Record<string, unknown>>;
        const communities = extractCommunities(res?.data);
        dispatch(setAllCommunities(communities));
      } catch (e) {
        console.error(e);
        dispatch(setAllCommunities([]));
      } finally {
        setFetchFinished(true);
      }
    })();
  }, [currentUser?.id, dispatch, fetchUsercommunities]);

  if (!fetchFinished && isEmpty(allCommunities)) {
    return <LoadingComponent />;
  }

  if (fetchFinished && isEmpty(allCommunities)) {
    return (
      <NoDataComponent
        title="No communities"
        subtitle="You are not a member of any community yet, or we could not load your communities. Try again later."
      />
    );
  }

  return (
    <div style={{ backgroundColor: "white", paddingBottom: 16 }}>
      <UpdateAvailable />
      <Text
        bold
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          marginTop: 12,
          marginBottom: 8,
          fontSize: 17,
          fontWeight: 600,
          display: "block",
        }}
      >
        My Communities
      </Text>
      <div>
        {allCommunities.map((item: Community, index: number) => (
          <div key={item.id ?? String(index)}>
            <CommunityItem item={item} />
            {index < allCommunities.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
