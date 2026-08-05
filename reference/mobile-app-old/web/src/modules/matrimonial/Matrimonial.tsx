import { useEffect, useState, useCallback } from "react";
import { filter, forEach, isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { getCommunityMembersForCommunityId } from "@/api/directoryApi";
import { useApi } from "@/api/useApi";
import type { RootState } from "@/store";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { ErrorComponent } from "@/components/ui/ErrorComponent";
import { SmallLoadingComponent } from "@/components/ui/SmallLoadingComponent";
import { Text } from "@/components/ui/Text";
import type { Member } from "@/types/types";
import MemberItem from "@/modules/directory/components/MemberItem";

export const LIMIT = 1000;

type Props = { gender?: string };

export default function Matrimonial({ gender = "Male" }: Props) {
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Member[]>([]);
  const [isLoadingMoreData, setIsLoadingMoreData] = useState(false);
  const [totalPages, setTotalPages] = useState(10);

  const {
    data: membersData,
    loading,
    error,
    request: fetchCommunityMembersForCommunityId,
  } = useApi(getCommunityMembersForCommunityId);

  const filters = {
    gender,
    isMarried: false,
    age: { max: 35, min: 21 },
  };

  useEffect(() => {
    setData([]);
    setCurrentPage(1);
  }, [communityId, gender]);

  useEffect(() => {
    if (!communityId || loading) return;
    if (currentPage > 1) {
      setIsLoadingMoreData(true);
      void (async () => {
        await fetchCommunityMembersForCommunityId(
          communityId,
          (currentPage - 1) * LIMIT,
          LIMIT,
          "",
          filters
        );
        setIsLoadingMoreData(false);
      })();
    }
  }, [currentPage, communityId, gender]);

  useEffect(() => {
    if (!communityId) return;
    void fetchCommunityMembersForCommunityId(
      communityId,
      0,
      LIMIT,
      "",
      filters
    );
  }, [communityId, gender]);

  useEffect(() => {
    const md = membersData as { members?: { rows?: Member[]; count?: number } } | undefined;
    if (isEmpty(md?.members?.rows)) return;
    setTotalPages(Math.ceil((md?.members?.count ?? 0) / LIMIT));
    setData((prev) => {
      const next = [...prev];
      forEach(md?.members?.rows, (member) => {
        const exists = filter(next, (d) => d?.id === member?.id).length;
        if (exists === 0) next.push(member);
      });
      return next;
    });
  }, [membersData]);

  const loadMoreData = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((c) => {
        const total = data.length;
        if (total === c * LIMIT) return c + 1;
        return c;
      });
    }
  }, [currentPage, totalPages, data.length]);

  if (error) return <ErrorComponent />;
  if (loading && isEmpty(data)) return <LoadingComponent />;
  if (!loading && isEmpty(data)) return <NoDataComponent />;

  const totalRows = (membersData as { members?: { count?: number } })?.members?.count;

  return (
    <div style={{ backgroundColor: "white", flex: 1, position: "relative" }}>
      <Text style={{ padding: "12px 16px 4px", fontSize: 12, display: "block" }}>
        Age - 21 to 35
      </Text>
      <Text bold style={{ padding: "0 16px 8px", fontSize: 14, display: "block" }}>
        Showing {totalRows} candidates
      </Text>
      <div
        onScroll={(e) => {
          const t = e.currentTarget;
          if (t.scrollHeight - t.scrollTop - t.clientHeight < 120) loadMoreData();
        }}
        style={{
          maxHeight: "calc(100vh - 260px)",
          overflowY: "auto",
          backgroundColor: "rgb(231, 240, 244)",
          paddingTop: 4,
          paddingBottom: 100,
        }}
      >
        {data.map((item) => (
          <MemberItem key={item.id} member={item} />
        ))}
        {isLoadingMoreData ? <SmallLoadingComponent /> : null}
      </div>
    </div>
  );
}
