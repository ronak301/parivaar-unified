import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { filter, isEmpty, lowerCase, some } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { getCommunityMembersForCommunityId } from "@/api/directoryApi";
import type { RootState } from "@/store";
import { setCommunity, setMembersListCache } from "@/modules/directory/redux/communitySlice";
import { membersCacheReady } from "@/modules/directory/utils/membersCacheReady";
import { parseMembersListPayload } from "@/modules/directory/utils/parseMembersResponse";
import { MEMBERS_BULK_LIMIT } from "@/modules/directory/membersBulkLimit";
import { normalizeMembersForDirectory } from "@/modules/directory/utils/normalizeMemberRow";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import SearchInput from "@/components/ui/SearchInput";
import { LAYOUT } from "@/theme/layout";
import { getStringAfterRemovingSpace } from "@/utils/utils";
import BusinessItem from "./BusinessItem";
import type { Member } from "@/types/types";
import { HeaderRefreshButton } from "@/components/ui/HeaderRefreshButton";

/** Same as directory: explicit false so the API returns every member, not only account managers. */
const MEMBERS_FILTERS: Record<string, unknown> = { isAccountManager: false };

export default function BusinessScreen() {
  const dispatch = useDispatch();
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const membersListCache = useSelector(
    (state: RootState) => state.community.membersListCache ?? {}
  );
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const ExcludeBusiness = [
    "Homemaker",
    "HomeMaker",
    "Home maker",
    "Homer maker",
    "Na",
    "No",
    "NA",
    "Retired",
    "-",
    "--",
    "---",
    "----",
  ];

  const communityId = selectedCommunity?.id;
  const membersEntry = communityId ? membersListCache[communityId] : undefined;
  const membersReady = membersCacheReady(membersEntry);

  const sourceMembers: Member[] = membersEntry?.rows ?? [];

  const filteredBusiness: Member[] = useMemo(() => {
    return filter(sourceMembers, (r: Member) => {
      if (
        !isEmpty(r?.business?.name) &&
        !some(ExcludeBusiness, (el) =>
          !lowerCase(r?.business?.type)?.localeCompare(
            lowerCase(getStringAfterRemovingSpace(el) ?? "")
          )
        ) &&
        !some(ExcludeBusiness, (el) =>
          !lowerCase(r?.business?.name)?.localeCompare(
            lowerCase(getStringAfterRemovingSpace(el) ?? "")
          )
        )
      ) {
        return r;
      }
      return false;
    }) as Member[];
  }, [sourceMembers]);

  const displayRows: Member[] = useMemo(() => {
    const q = query.replace(/\s/g, "").trim().toLowerCase();
    if (!q) return filteredBusiness;
    return filteredBusiness.filter((r) => {
      const name = (r?.business?.name ?? "").toLowerCase();
      const type = (r?.business?.type ?? "").toLowerCase();
      return name.includes(q) || type.includes(q);
    });
  }, [filteredBusiness, query]);

  const reloadMembersFromServer = useCallback(async () => {
    if (!communityId) return;
    setRefreshError(false);
    setRefreshing(true);
    try {
      const res = await getCommunityMembersForCommunityId(
        communityId,
        0,
        MEMBERS_BULK_LIMIT,
        "",
        MEMBERS_FILTERS
      );
      const body = (res as { data?: unknown }).data;
      const md = parseMembersListPayload(body);
      if (!md?.members) return;

      const newRows = normalizeMembersForDirectory(md.members?.rows ?? []);
      const count = md.members?.count ?? 0;
      const prev = selectedCommunity;
      const totalMembers =
        md.totalMembers != null && String(md.totalMembers) !== ""
          ? String(md.totalMembers)
          : prev?.totalMembers;
      const totalFamilyHeads =
        md.totalFamilyHeads != null && String(md.totalFamilyHeads) !== ""
          ? String(md.totalFamilyHeads)
          : prev?.totalFamilyHeads;

      dispatch(
        setCommunity({
          ...(prev ?? {}),
          ...(totalMembers != null ? { totalMembers } : {}),
          ...(totalFamilyHeads != null ? { totalFamilyHeads } : {}),
        })
      );
      dispatch(
        setMembersListCache({
          communityId,
          rows: newRows,
          totalCount: count,
          totalMembers,
          totalFamilyHeads,
          bulkLoaded: true,
        })
      );
    } catch (e) {
      console.error(e);
      setRefreshError(true);
    } finally {
      setRefreshing(false);
    }
  }, [communityId, dispatch, selectedCommunity]);

  const hasSourceRows = filteredBusiness.length > 0;
  const showBlockingSpinner = Boolean(communityId && membersReady && refreshing && !hasSourceRows);

  let main: ReactNode = null;
  if (!communityId) {
    main = <NoDataComponent subtitle="Select a community from Home first." />;
  } else if (!membersReady) {
    main = (
      <NoDataComponent subtitle="Open the Members tab once to load the directory. Businesses use that same list (no separate request when you switch tabs)." />
    );
  } else if (refreshError && sourceMembers.length === 0) {
    main = <NoDataComponent subtitle="Could not refresh. Try again or open the Members tab." />;
  } else if (showBlockingSpinner) {
    main = (
      <div style={{ padding: 24, textAlign: "center", color: "#666", fontSize: 14 }}>
        Refreshing…
      </div>
    );
  } else if (membersReady && !hasSourceRows) {
    main = (
      <NoDataComponent subtitle="No businesses found in the member directory for this community." />
    );
  } else if (hasSourceRows) {
    main = (
      <div style={{ padding: "8px 0", paddingBottom: 32 }}>
        {!displayRows?.length ? (
          <NoDataComponent subtitle="No matching businesses for this view or search." />
        ) : (
          displayRows.map((item: Member, index: number) => (
            <BusinessItem key={item.id} item={item} index={index} />
          ))
        )}
      </div>
    );
  } else {
    main = <NoDataComponent />;
  }

  return (
    <div style={{ backgroundColor: "white", flex: 1, minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: LAYOUT.searchFieldInsetX,
          paddingRight: LAYOUT.searchFieldInsetX,
          paddingTop: LAYOUT.searchFieldInsetTop,
          paddingBottom: LAYOUT.searchFieldInsetBottom,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchInput placeholder="Search Gold, Hardware etc" query={query} setQuery={setQuery} />
        </div>
        <HeaderRefreshButton
          appearance="light"
          disabled={refreshing || !communityId}
          onClick={() => void reloadMembersFromServer()}
          label="Reload businesses from directory"
        />
      </div>
      {main}
    </div>
  );
}
