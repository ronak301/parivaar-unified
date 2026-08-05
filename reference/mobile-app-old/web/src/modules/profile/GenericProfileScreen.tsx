import { useEffect, useState, useRef } from "react";
import { getMemberDetails } from "@/api/directoryApi";
import { MemberDetailsContextProvider } from "@/modules/directory/hooks/useMemberDetails";
import Profile from "@/modules/directory/screens/MemberDetails/components/Profile";
import type { Member } from "@/types/types";
import { useDispatch, useSelector } from "react-redux";
import { setProfileMeta, setMemberCache } from "@/modules/profile/redux/profileSlice";
import type { RootState } from "@/store";
import { store } from "@/store";
import { sendEvent } from "@/api/events";
import { unwrapApiBody } from "@/utils/unwrapApiBody";
import { NoDataComponent } from "@/components/ui/NoDataComponent";

type Props = {
  id?: string;
};

function parseMemberFromResponse(res: unknown): Member | undefined {
  if (res == null || typeof res !== "object" || !("data" in (res as object))) {
    return undefined;
  }
  const axiosData = (res as { data?: unknown }).data;
  if (axiosData == null || typeof axiosData !== "object") return undefined;
  const flat = unwrapApiBody(axiosData as Record<string, unknown>);
  const nestedUser = flat.user;
  if (nestedUser && typeof nestedUser === "object" && !Array.isArray(nestedUser)) {
    return nestedUser as Member;
  }
  if (flat.id || flat.firstName) {
    return flat as unknown as Member;
  }
  return undefined;
}

export default function GenericProfileScreen({ id }: Props) {
  const { currentOpenedUser, shouldUpdateUser, shouldUpdateUserId } = useSelector(
    (state: RootState) => state?.profile?.meta
  );
  const cachedMemberForId = useSelector((state: RootState) =>
    id ? state?.profile?.memberByIdCache?.[id] : undefined
  );
  const [details, setDetails] = useState<Member | null>(null);
  const dispatch = useDispatch();
  const currentLoggedInUser = useSelector((state: RootState) => state?.auth?.currentUser);
  const [loadFinished, setLoadFinished] = useState(false);
  const requestGen = useRef(0);
  const prevIdRef = useRef<string | undefined>(undefined);

  const cached = cachedMemberForId;
  const effective = (details?.id ? details : cached) ?? null;
  const shallThisUserBeUpdated =
    (details?.id ?? cached?.id) === shouldUpdateUserId;

  useEffect(() => {
    if (shouldUpdateUser && shallThisUserBeUpdated && currentOpenedUser) {
      setDetails(currentOpenedUser as Member);
    }
  }, [shouldUpdateUser, shallThisUserBeUpdated, currentOpenedUser]);

  useEffect(() => {
    if (!id) {
      prevIdRef.current = undefined;
      return;
    }
    if (prevIdRef.current === id) return;
    prevIdRef.current = id;
    setDetails(null);
    const hasCache = !!store.getState().profile.memberByIdCache?.[id]?.id;
    setLoadFinished(hasCache);
  }, [id]);

  /** When cache fills (e.g. persist rehydrate or another tab), unblock UI without re-running fetch. */
  useEffect(() => {
    if (!id) return;
    if (cachedMemberForId?.id) {
      setLoadFinished(true);
    }
  }, [id, cachedMemberForId?.id]);

  /**
   * Fetch only depends on `id` + `dispatch`. Do **not** depend on `cachedMemberForId` — that caused the
   * effect to re-run when the cache updated, cancelling the in-flight request before it could dispatch.
   */
  useEffect(() => {
    if (!id) return;

    if (store.getState().profile.memberByIdCache?.[id]?.id) {
      return;
    }

    const rid = ++requestGen.current;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getMemberDetails(id);
        if (cancelled || rid !== requestGen.current) return;
        const member = parseMemberFromResponse(res);
        if (member?.id) {
          dispatch(setMemberCache({ id: member.id, member }));
        }
        dispatch(
          setProfileMeta({
            currentOpenedUser: member ?? null,
            shouldUpdateUser: false,
            shouldUpdateUserId: "",
          })
        );
        if (member) setDetails(member);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled && rid === requestGen.current) setLoadFinished(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (
      currentOpenedUser &&
      currentOpenedUser?.id === id &&
      currentLoggedInUser?.id !== currentOpenedUser?.id
    ) {
      sendEvent(
        `Profile of -  ${currentOpenedUser?.firstName}(${currentOpenedUser?.phone}) visited by ${currentLoggedInUser?.firstName} ${currentLoggedInUser?.lastName} (${currentLoggedInUser?.phone})`
      );
    }
  }, [currentOpenedUser, currentLoggedInUser, id]);

  if (!id) {
    return <NoDataComponent subtitle="No profile to show." />;
  }

  if (!effective?.id) {
    if (!loadFinished) {
      return (
        <div
          style={{
            flex: 1,
            minHeight: "min(50vh, 320px)",
            backgroundColor: "rgb(231, 240, 244)",
          }}
        />
      );
    }
    return <NoDataComponent subtitle="Could not load this profile." />;
  }

  return (
    <MemberDetailsContextProvider memberDetails={effective}>
      <Profile />
    </MemberDetailsContextProvider>
  );
}
