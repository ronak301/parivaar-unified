import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCommunityMembersForCommunityId } from "@/api/directoryApi";
import type { RootState } from "@/store";
import {
  setCommunity,
  setFamilyHeadRowsCache,
  setMembersListCache,
} from "@/modules/directory/redux/communitySlice";
import { useCommunityConfig } from "@/hooks/useCommunityConfig";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { ErrorComponent } from "@/components/ui/ErrorComponent";
import { SmallLoadingComponent } from "@/components/ui/SmallLoadingComponent";
import { Check } from "@/components/ui/Check";
import type { Member } from "@/types/types";
import MemberItem from "./MemberItem";
import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Switch,
  Text,
} from "@chakra-ui/react";
import { parseMembersListPayload } from "@/modules/directory/utils/parseMembersResponse";
import { membersCacheReady } from "@/modules/directory/utils/membersCacheReady";
import { MEMBERS_BULK_LIMIT } from "@/modules/directory/membersBulkLimit";
import { LAYOUT } from "@/theme/layout";
import { filterMembersLocalSearch } from "@/modules/directory/utils/filterMembersLocalSearch";
import {
  memberIsAccountManagerTrue,
  normalizeMembersForDirectory,
} from "@/modules/directory/utils/normalizeMemberRow";

const directoryScrollStorageKey = (id: string) => `parivaar:dirScroll:${id}`;

/** Client-side window: render in pages so large rosters stay cheap (no extra API calls). */
const DIRECTORY_MEMBERS_PAGE_SIZE = 20;
const DIRECTORY_SCROLL_LOAD_MORE_PX = 160;
/** Approximate row height for restoring scroll position before enough rows are mounted. */
const DIRECTORY_MEMBER_ROW_ESTIMATE_PX = 76;

function MembersListInner() {
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  /** Only this community’s cache — avoids rerunning sync when other communities update in Redux. */
  const membersCacheEntry = useSelector((state: RootState) =>
    communityId ? state.community.membersListCache?.[communityId] : undefined
  );
  const familyHeadSnapshot = membersCacheEntry?.familyHeadRows;
  const searchQuery = useSelector((state: RootState) => state?.search?.query);
  const searchFilter = useSelector((state: RootState) => state?.search?.filter);
  /** Immediate trim (no debounce) so clearing the search bar updates filters and Family Head mode right away. */
  const searchTextTrimmed = useMemo(
    () => (searchQuery ?? "").replace(/\s/g, "").trim(),
    [searchQuery]
  );
  /** In sync with filtering: when true, list only rows with `isAccountManager` true (after normalize). Default on. */
  const [showOnlyAccountManagers, setShowOnlyAccountManagers] = useState(true);
  const prevSearchOrFiltersActive = useRef(false);
  const prevSearchTextTrimRef = useRef("");
  /** Search bar × clears text: re-check “Only Family Heads” (same intent as clearing filters). */
  useEffect(() => {
    const q = searchTextTrimmed;
    const prev = prevSearchTextTrimRef.current;
    if (prev.length > 0 && q.length === 0) {
      setShowOnlyAccountManagers(true);
    }
    prevSearchTextTrimRef.current = q;
  }, [searchTextTrimmed]);
  const selectedCommunityRef = useRef(selectedCommunity);
  selectedCommunityRef.current = selectedCommunity;

  const [rows, setRows] = useState<Member[]>([]);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const [totalCount, setTotalCount] = useState(0);
  const totalCountRef = useRef(totalCount);
  totalCountRef.current = totalCount;

  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  useCommunityConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bgRequestIdRef = useRef(0);
  const [hasTriedLoad, setHasTriedLoad] = useState(false);
  /** When bulk roster omits `isAccountManager`, fetch family-head list once and store in Redux cache. */
  const mukhiyaFallbackReqIdRef = useRef(0);

  const currentUser = useSelector((state: RootState) => state?.auth?.currentUser);
  const isSuperAdmin = currentUser?.isSuperAdmin;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /**
   * Must set `isAccountManager: false` — omitting the key lets the API default to heads/account-managers only.
   * Matches native search when not restricting to family heads.
   */
  const membersFetchFilter: Record<string, unknown> = { isAccountManager: false };

  const applyPayloadToRows = useCallback(
    (md: NonNullable<ReturnType<typeof parseMembersListPayload>>) => {
      const newRows = normalizeMembersForDirectory(md.members?.rows ?? []);
      const count = md.members?.count ?? 0;
      setTotalCount(count);

      if (isEmpty(newRows)) {
        setRows([]);
        return;
      }

      setRows(newRows);

      const prev = selectedCommunityRef.current;
      const nextMembers =
        md.totalMembers != null && String(md.totalMembers) !== ""
          ? String(md.totalMembers)
          : prev?.totalMembers;
      const nextFamilies =
        md.totalFamilyHeads != null && String(md.totalFamilyHeads) !== ""
          ? String(md.totalFamilyHeads)
          : prev?.totalFamilyHeads;

      dispatch(
        setCommunity({
          ...(prev ?? {}),
          ...(nextMembers != null ? { totalMembers: nextMembers } : {}),
          ...(nextFamilies != null ? { totalFamilyHeads: nextFamilies } : {}),
        })
      );
    },
    [dispatch]
  );

  const persistCacheFromState = useCallback(
    (
      nextRows: Member[],
      nextTotal: number,
      md: ReturnType<typeof parseMembersListPayload> | undefined,
      bulkLoaded: boolean
    ) => {
      if (!communityId) return;
      const prev = selectedCommunityRef.current;
      const totalMembers =
        md?.totalMembers != null && String(md.totalMembers) !== ""
          ? String(md.totalMembers)
          : prev?.totalMembers;
      const totalFamilyHeads =
        md?.totalFamilyHeads != null && String(md.totalFamilyHeads) !== ""
          ? String(md.totalFamilyHeads)
          : prev?.totalFamilyHeads;
      dispatch(
        setMembersListCache({
          communityId,
          rows: nextRows,
          totalCount: nextTotal,
          totalMembers,
          totalFamilyHeads,
          bulkLoaded,
        })
      );
    },
    [communityId, dispatch]
  );

  const fetchMembersBulk = useCallback(async () => {
    if (!communityId) return;
    const reqId = ++bgRequestIdRef.current;
    setFetchError("");
    setRefreshing(true);
    try {
      const res = await getCommunityMembersForCommunityId(
        communityId,
        0,
        MEMBERS_BULK_LIMIT,
        "",
        membersFetchFilter
      );
      if (reqId !== bgRequestIdRef.current) return;
      const body = (res as { data?: unknown }).data;
      const md = parseMembersListPayload(body);
      if (!md?.members) return;

      const newRows = normalizeMembersForDirectory(md.members?.rows ?? []);
      const count = md.members?.count ?? 0;
      applyPayloadToRows(md);
      persistCacheFromState(newRows, count, md, true);
    } catch (err: unknown) {
      if (reqId !== bgRequestIdRef.current) return;
      const message = err instanceof Error ? err.message : "Unexpected Error!!";
      console.error(err);
      setFetchError(message);
    } finally {
      if (reqId === bgRequestIdRef.current) {
        setHasTriedLoad(true);
        setRefreshing(false);
      }
    }
  }, [communityId, applyPayloadToRows, persistCacheFromState]);

  useEffect(() => {
    if (!communityId) {
      setRows([]);
      setTotalCount(0);
      setHasTriedLoad(false);
      return;
    }
    const cache = membersCacheEntry;
    if (cache?.rows) {
      setRows(normalizeMembersForDirectory(cache.rows));
      setTotalCount(cache.totalCount);
      setHasTriedLoad(membersCacheReady(cache));
    } else {
      setRows([]);
      setTotalCount(0);
      setHasTriedLoad(false);
    }

    const ready = membersCacheReady(membersCacheEntry);
    if (ready) {
      return;
    }
    void fetchMembersBulk();
  }, [communityId, fetchMembersBulk, membersCacheEntry]);

  /** Search or filter sheet active (drives auto-uncheck / restore of Family Head checkbox). */
  const searchOrFiltersActive = useMemo(() => {
    if (searchTextTrimmed.length > 0) return true;
    const f = searchFilter;
    if (!f) return false;
    if (f.bloodGroup) return true;
    if (f.locality && String(f.locality).trim() !== "") return true;
    if (f.businessType && String(f.businessType).trim() !== "") return true;
    if (f.showUnmarried) return true;
    if (f.gender && String(f.gender).trim() !== "") return true;
    const age = f.age;
    if (age != null && (age.min !== 0 || age.max !== 100)) return true;
    return false;
  }, [searchTextTrimmed, searchFilter]);

  /**
   * Entering search/filters: auto-uncheck Family Head.
   * Leaving (cleared search ×, Filters “Clear All”, or any path to no search + no filters): re-check Family Heads.
   */
  useEffect(() => {
    const active = searchOrFiltersActive;
    const prev = prevSearchOrFiltersActive.current;
    if (active && !prev) {
      setShowOnlyAccountManagers((was) => (was ? false : was));
    } else if (!active && prev) {
      setShowOnlyAccountManagers(true);
    }
    prevSearchOrFiltersActive.current = active;
  }, [searchOrFiltersActive]);

  const clientMukhiyaCount = useMemo(
    () => rows.reduce((n, m) => n + (memberIsAccountManagerTrue(m) ? 1 : 0), 0),
    [rows]
  );

  /** Full roster has no `isAccountManager` on rows — need server-filtered mukhiya list for default view. */
  const needsMukhiyaServerFallback = useMemo(
    () =>
      Boolean(
        showOnlyAccountManagers &&
          !searchOrFiltersActive &&
          rows.length > 0 &&
          clientMukhiyaCount === 0
      ),
    [showOnlyAccountManagers, searchOrFiltersActive, rows.length, clientMukhiyaCount]
  );

  /**
   * Fetch family-head-only list once per bulk snapshot; result lives in Redux (`familyHeadRowsCache`)
   * so navigating to Filters and back does not trigger another request.
   */
  useEffect(() => {
    if (!communityId || !needsMukhiyaServerFallback) return;
    if (familyHeadSnapshot !== undefined) return;

    const reqId = ++mukhiyaFallbackReqIdRef.current;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getCommunityMembersForCommunityId(
          communityId,
          0,
          MEMBERS_BULK_LIMIT,
          "",
          { isAccountManager: true }
        );
        if (cancelled || reqId !== mukhiyaFallbackReqIdRef.current) return;
        const body = (res as { data?: unknown }).data;
        const md = parseMembersListPayload(body);
        const list = normalizeMembersForDirectory(md?.members?.rows ?? []);
        dispatch(setFamilyHeadRowsCache({ communityId, rows: list }));
      } catch (e) {
        console.error(e);
        if (!cancelled && reqId === mukhiyaFallbackReqIdRef.current) {
          dispatch(setFamilyHeadRowsCache({ communityId, rows: [] }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [communityId, needsMukhiyaServerFallback, familyHeadSnapshot, dispatch]);

  const localSearchOptions = useMemo((): Parameters<typeof filterMembersLocalSearch>[1] => {
    const updatedFilters = {
      bloodGroup:
        typeof searchFilter?.bloodGroup === "object" && searchFilter?.bloodGroup !== null
          ? (searchFilter.bloodGroup as { id: string }).id
          : (searchFilter?.bloodGroup as string | undefined),
      locality: searchFilter?.locality,
      businessType: searchFilter?.businessType,
      showUnmarried: searchFilter?.showUnmarried,
      age: searchFilter?.age,
      gender: searchFilter?.gender,
    };

    const removedFalsy = Object.fromEntries(
      Object.entries(updatedFilters).filter(([, v]) => v != null)
    );

    /** If full roster has no AM flags, we load mukhiya rows from the server — do not filter full list to zero. */
    const applyClientMukhiyaFilter =
      showOnlyAccountManagers && (clientMukhiyaCount > 0 || !needsMukhiyaServerFallback);

    return {
      query: searchTextTrimmed,
      showOnlyAccountManagers: applyClientMukhiyaFilter ? true : undefined,
      ...(removedFalsy.bloodGroup && { bloodGroup: removedFalsy.bloodGroup as string }),
      ...(removedFalsy.locality && { locality: removedFalsy.locality as string }),
      ...(removedFalsy.businessType && { businessType: removedFalsy.businessType as string }),
      ...(removedFalsy.showUnmarried && { showUnmarried: true }),
      ...(removedFalsy.age && { age: removedFalsy.age as { min: number; max: number } }),
      ...(removedFalsy.gender && { gender: removedFalsy.gender as string }),
    };
  }, [
    searchFilter,
    showOnlyAccountManagers,
    searchTextTrimmed,
    clientMukhiyaCount,
    needsMukhiyaServerFallback,
  ]);

  const sourceRowsForDirectory = useMemo(() => {
    if (needsMukhiyaServerFallback && familyHeadSnapshot === undefined) return [];
    if (needsMukhiyaServerFallback && familyHeadSnapshot !== undefined) return familyHeadSnapshot;
    return rows;
  }, [rows, needsMukhiyaServerFallback, familyHeadSnapshot]);

  const displayRows = useMemo(() => {
    if (!sourceRowsForDirectory.length) return [];
    return filterMembersLocalSearch(sourceRowsForDirectory, localSearchOptions);
  }, [sourceRowsForDirectory, localSearchOptions]);

  const displayRowsRef = useRef(displayRows);
  displayRowsRef.current = displayRows;

  const pendingScrollYRef = useRef<number | null>(null);

  const [visibleCount, setVisibleCount] = useState(DIRECTORY_MEMBERS_PAGE_SIZE);

  const visibleRows = useMemo(
    () => displayRows.slice(0, visibleCount),
    [displayRows, visibleCount]
  );

  /** Bulk roster ↔ mukhiya snapshot: reset window (skip initial mukhiya fetch so session restore still works). */
  const directorySourceKindRef = useRef<"mukhiya_pending" | "mukhiya_rows" | "bulk_rows" | null>(null);
  useEffect(() => {
    const kind: "mukhiya_pending" | "mukhiya_rows" | "bulk_rows" =
      needsMukhiyaServerFallback && familyHeadSnapshot === undefined
        ? "mukhiya_pending"
        : needsMukhiyaServerFallback
          ? "mukhiya_rows"
          : "bulk_rows";

    const prev = directorySourceKindRef.current;
    if (prev === null) {
      directorySourceKindRef.current = kind;
      return;
    }
    if (prev === kind) return;

    const skipResetBecauseMukhiyaJustLoaded =
      prev === "mukhiya_pending" && kind === "mukhiya_rows";
    directorySourceKindRef.current = kind;

    if (skipResetBecauseMukhiyaJustLoaded) return;

    setVisibleCount(DIRECTORY_MEMBERS_PAGE_SIZE);
    pendingScrollYRef.current = null;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [communityId, needsMukhiyaServerFallback, familyHeadSnapshot]);

  /** Search / filters changed: reset window and scroll (skip first run so session restore on mount is preserved). */
  const localSearchOptionsSeenRef = useRef(false);
  const prevLocalSearchOptionsRef = useRef(localSearchOptions);
  useEffect(() => {
    if (!localSearchOptionsSeenRef.current) {
      localSearchOptionsSeenRef.current = true;
      prevLocalSearchOptionsRef.current = localSearchOptions;
      return;
    }
    if (prevLocalSearchOptionsRef.current === localSearchOptions) return;
    prevLocalSearchOptionsRef.current = localSearchOptions;
    setVisibleCount(DIRECTORY_MEMBERS_PAGE_SIZE);
    pendingScrollYRef.current = null;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [localSearchOptions]);

  useLayoutEffect(() => {
    if (!communityId) {
      pendingScrollYRef.current = null;
      return;
    }
    directorySourceKindRef.current = null;
    localSearchOptionsSeenRef.current = false;
    setVisibleCount(DIRECTORY_MEMBERS_PAGE_SIZE);
    const raw = sessionStorage.getItem(directoryScrollStorageKey(communityId));
    const y = raw != null ? Number.parseInt(raw, 10) : 0;
    pendingScrollYRef.current = Number.isFinite(y) && y > 0 ? y : null;
  }, [communityId]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const y = pendingScrollYRef.current;
    if (!el || !communityId || displayRows.length === 0 || y == null) return;

    const needed = Math.min(
      displayRows.length,
      Math.max(
        DIRECTORY_MEMBERS_PAGE_SIZE,
        Math.ceil((y + el.clientHeight) / DIRECTORY_MEMBER_ROW_ESTIMATE_PX) + 8
      )
    );

    if (visibleCount < needed) {
      setVisibleCount(needed);
      return;
    }

    el.scrollTop = Math.min(y, Math.max(0, el.scrollHeight - el.clientHeight));
    pendingScrollYRef.current = null;
  }, [communityId, displayRows.length, visibleCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !communityId) return;
    let timeoutId = 0;
    const onScroll = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        sessionStorage.setItem(directoryScrollStorageKey(communityId), String(el.scrollTop));
      }, 120);

      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight > DIRECTORY_SCROLL_LOAD_MORE_PX) return;
      setVisibleCount((c) => {
        const max = displayRowsRef.current.length;
        if (c >= max) return c;
        return Math.min(c + DIRECTORY_MEMBERS_PAGE_SIZE, max);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timeoutId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [communityId]);

  const mukhiyaFallbackLoading =
    needsMukhiyaServerFallback && familyHeadSnapshot === undefined;

  const filteredCount = displayRows.length;

  if (fetchError && isEmpty(rows) && hasTriedLoad) {
    return <ErrorComponent />;
  }

  const showEmptyState = !fetchError && isEmpty(rows) && hasTriedLoad && !refreshing;

  if (showEmptyState) {
    return <NoDataComponent />;
  }

  /** FAB sits just above the tab bar, aligned to the 480px shell’s right edge on wide viewports. */
  const fabBottomAboveTabs = `calc(${LAYOUT.bottomTabHeight}px + max(8px, env(safe-area-inset-bottom, 0px)) + 10px)`;
  const fabRightAlignedToShell = `max(12px, calc((100vw - ${LAYOUT.shellMaxWidth}px) / 2 + 12px))`;

  return (
    <Flex
      direction="column"
      flex={1}
      minH={0}
      overflow="hidden"
      position="relative"
      bg="gray.50"
    >
      <Box flexShrink={0} bg="gray.50" px={2.5} py={1.5} borderBottomWidth="1px" borderColor="gray.200">
        <Text fontSize="xs" color="gray.600" lineHeight="short">
          {filteredCount} {filteredCount === 1 ? "member" : "members"}
          {searchOrFiltersActive ? " shown" : ""}
        </Text>
      </Box>

      <Box
        flexShrink={0}
        bg="white"
        px={3}
        py={1.5}
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <FormControl display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <FormLabel
            htmlFor="family-head-toggle"
            mb={0}
            fontSize="xs"
            fontWeight="medium"
            color="gray.800"
            title="Uses member isAccountManager: when checked, only family heads (account managers). Uncheck to show everyone in the loaded list. Clearing search or filters re-checks this."
          >
            Only Family Heads
          </FormLabel>
          <Switch
            id="family-head-toggle"
            colorScheme="brand"
            size="sm"
            isChecked={showOnlyAccountManagers}
            onChange={(e) => setShowOnlyAccountManagers(e.target.checked)}
            aria-label="Only show family heads (isAccountManager)"
          />
        </FormControl>
      </Box>

      <Check ifPresent={isSuperAdmin}>
        <IconButton
          aria-label="Add member"
          icon={<span style={{ fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>}
          colorScheme="brand"
          borderRadius="full"
          w="48px"
          h="48px"
          minW="48px"
          minH="48px"
          position="fixed"
          zIndex={45}
          bottom={fabBottomAboveTabs}
          right={fabRightAlignedToShell}
          boxShadow="0 4px 14px rgba(7, 119, 255, 0.35)"
          onClick={() => navigate("/add-member")}
        />
      </Check>

      {refreshing && isEmpty(rows) ? (
        <Center flex={1}>
          <SmallLoadingComponent />
        </Center>
      ) : (
        <Box
          ref={scrollRef}
          flex="1 1 0%"
          minH={0}
          overflowY="auto"
          overflowX="hidden"
          sx={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
          pt={1}
          pb={isSuperAdmin ? 24 : 2}
        >
          {mukhiyaFallbackLoading ? (
            <Center minH={200}>
              <SmallLoadingComponent />
            </Center>
          ) : !displayRows.length && rows.length > 0 ? (
            <NoDataComponent subtitle="No matches for this search or filters. Try different text or clear filters." />
          ) : (
            visibleRows.map((item) => <MemberItem key={item.id} member={item} />)
          )}
        </Box>
      )}
    </Flex>
  );
}

export default memo(MembersListInner);
