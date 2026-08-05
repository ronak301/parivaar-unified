import { useEffect, useState, useRef } from "react";
import { filter, isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { getCommunityDetailsForId } from "@/api/directoryApi";
import { useApi } from "@/api/useApi";
import type { RootState } from "@/store";
import { setCommunity } from "@/modules/directory/redux/communitySlice";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import type { Executive } from "@/types/types";
import MemberItem from "./MemberItem";

export default function ExecutiveMembersList() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const dispatch = useDispatch();
  const selectedCommunityId = selectedCommunity?.id;

  const { loading, request } = useApi(getCommunityDetailsForId);
  const fetchedForId = useRef<string | undefined>();

  useEffect(() => {
    setData(null);
    fetchedForId.current = undefined;
  }, [selectedCommunityId]);

  useEffect(() => {
    (async () => {
      if (!selectedCommunityId) return;
      if (fetchedForId.current === selectedCommunityId) return;
      const res = await request(selectedCommunityId);
      const body = (res as { data?: Record<string, unknown> })?.data;
      setData(body ?? null);
      fetchedForId.current = selectedCommunityId;
      dispatch(
        setCommunity({
          ...(selectedCommunity ?? {}),
          ...(body ?? {}),
        })
      );
    })();
  }, [selectedCommunityId, request, dispatch, selectedCommunity]);

  const getOrderedList = (list: Executive[] | undefined) => {
    if (!list || list.length <= 1) return list ?? [];
    const listCopy = [...list];
    const ExecutivesPostOrder = [
      "अध्यक्ष",
      "मंत्री",
      "उपाध्यक्ष",
      "सहमंत्री",
      "कोषाध्यक्ष",
      "संगठन मंत्री",
    ];
    listCopy.sort((r1, r2) => {
      const type1 = r1?.executive?.roles?.[0];
      const type2 = r2?.executive?.roles?.[0];
      if (type1 === type2) return 0;
      for (let i = 0; i < ExecutivesPostOrder.length; i++) {
        const o = ExecutivesPostOrder[i];
        if (type1 === o) return -1;
        if (type2 === o) return 1;
      }
      return 0;
    });
    return listCopy;
  };

  const filteredList = filter(data?.executives as Executive[] | undefined, (e) => {
    const filtersWithoutAdmin = filter(
      e?.executive?.roles,
      (r: string) => r !== "ADMIN"
    );
    return filtersWithoutAdmin?.length >= 1;
  });

  const orderedList = getOrderedList(filteredList);

  if (loading) {
    return <LoadingComponent />;
  }

  if (!loading && isEmpty(orderedList)) {
    return <NoDataComponent />;
  }

  return (
    <div style={{ backgroundColor: "rgb(231, 240, 244)", paddingBottom: 100 }}>
      {orderedList.map((item) => (
        <MemberItem key={item.id} member={item} as="executive" />
      ))}
    </div>
  );
}
