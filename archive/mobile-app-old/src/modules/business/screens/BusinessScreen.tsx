import React from "react";
import { useApi } from "src/api/useApi";
import { getAllBusinesses } from "src/api/businessApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import FlatList from "src/ui/FlatList";
import LoadingComponent from "src/ui/LoadingComponent";
import BusinessItem from "./components/BusinessItem";
import { isEmpty, lowerCase, some } from "lodash";
import NoDataComponent from "src/ui/NoDataComponent";
import { Text } from "src/ui/Text";
import { getStringAfterRemovingSpace } from "src/utils/utils";
import SearchInput from "src/ui/SearchInput";
import Animated, { FadeInDown } from "react-native-reanimated";
import { setBusinessListCache } from "src/modules/directory/redux/communitySlice";
import type { Member } from "src/types/types";

function parseBusinessRowsFromAxiosData(apiData: unknown): Member[] {
  if (apiData == null) return [];
  if (Array.isArray(apiData)) return apiData as Member[];
  if (typeof apiData !== "object") return [];
  const o = apiData as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner) && "rows" in inner) {
    const rows = (inner as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Member[]) : [];
  }
  const topRows = o.rows;
  return Array.isArray(topRows) ? (topRows as Member[]) : [];
}

const BusinessScreen = () => {
  const dispatch = useDispatch();
  const { loading, error, request } = useApi(getAllBusinesses);
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const businessListCache = useSelector(
    (state: RootState) => state.community.businessListCache ?? {}
  );

  const communityId = selectedCommunity?.id;
  const cacheEntry = communityId ? businessListCache[communityId] : undefined;
  const bulkLoaded = Boolean(cacheEntry?.bulkLoaded);
  const sourceRows = cacheEntry?.rows ?? [];

  const [query, setQuery] = React.useState("");
  const [fetchOnceFailed, setFetchOnceFailed] = React.useState(false);

  React.useEffect(() => {
    setFetchOnceFailed(false);
  }, [communityId]);

  const ExcludeBusiness = [
    "Homemaker",
    "HomeMaker",
    "Home maker",
    "Homer maker",
    "Na",
    "No",
    "NA",
    "Retired",
    "Home maker",
    "-",
    "--",
    "---",
    "----",
  ];

  React.useEffect(() => {
    if (!communityId || bulkLoaded || fetchOnceFailed) return;

    let cancelled = false;
    (async () => {
      const res = await request(communityId, "", {});
      if (cancelled) return;
      if (typeof res === "string") {
        setFetchOnceFailed(true);
        return;
      }
      const axiosBody = (res as { data?: unknown })?.data;
      const rows = parseBusinessRowsFromAxiosData(axiosBody);
      dispatch(setBusinessListCache({ communityId, rows, bulkLoaded: true }));
    })();

    return () => {
      cancelled = true;
    };
  }, [communityId, bulkLoaded, fetchOnceFailed, request, dispatch]);

  const filteredBusiness = React.useMemo((): Member[] => {
    return sourceRows.filter((r: Member) => {
      return (
        !isEmpty(r?.business?.name) &&
        !some(
          ExcludeBusiness,
          (el) =>
            !lowerCase(r?.business?.type)?.localeCompare(
              lowerCase(getStringAfterRemovingSpace(el))
            )
        ) &&
        !some(
          ExcludeBusiness,
          (el) =>
            !lowerCase(r?.business?.name)?.localeCompare(
              lowerCase(getStringAfterRemovingSpace(el))
            )
        )
      );
    });
  }, [sourceRows]);

  const displayRows = React.useMemo(() => {
    const q = query.replace(/\s/g, "").trim().toLowerCase();
    if (!q) return filteredBusiness;
    return filteredBusiness.filter((r) => {
      const name = (r?.business?.name ?? "").toLowerCase();
      const type = (r?.business?.type ?? "").toLowerCase();
      return name.includes(q) || type.includes(q);
    });
  }, [filteredBusiness, query]);

  const renderItem = ({ item, index }: { item: Member; index: number }) => {
    return <BusinessItem item={item} index={index} />;
  };

  const showInitialLoader = !bulkLoaded && loading && isEmpty(sourceRows);
  const showErrorState = Boolean(error) && !bulkLoaded && isEmpty(sourceRows);

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={{ backgroundColor: "white", flex: 1, position: "relative" }}>
      <>
        <SearchInput
          placeholder="Search Gold, Hardware etc"
          query={query}
          setQuery={setQuery}
        />

        {showErrorState ? (
          <NoDataComponent subtitle="Could not load businesses. Pull to refresh or try again later." />
        ) : showInitialLoader ? (
          <LoadingComponent />
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={<NoDataComponent />}
            style={{ paddingVertical: 8 }}
            renderItem={renderItem}
            data={displayRows}
            ListHeaderComponent={
              <Text
                bold
                style={{
                  paddingLeft: 16,
                  paddingTop: 4,
                }}>{`${displayRows?.length} Results Found`}</Text>
            }
          />
        )}
      </>
    </Animated.View>
  );
};

export default BusinessScreen;
