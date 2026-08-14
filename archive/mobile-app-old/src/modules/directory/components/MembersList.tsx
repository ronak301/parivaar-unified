import { Dimensions, TouchableOpacity, View } from "react-native";
import React from "react";
import { Member } from "src/types/types";
import MemberItem from "../components/MemberItem";
import LoadingComponent from "src/ui/LoadingComponent";
import NoDataComponent from "src/ui/NoDataComponent";
import FlatList from "src/ui/FlatList";
import { useApi } from "src/api/useApi";
import { getCommunityMembersForCommunityId } from "src/api/directoryApi";
import { filter, forEach, isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { useFocusEffect, useRouter } from "expo-router";
import { setCommunity } from "../redux/communitySlice";
import { useCommunityConfig } from "src/hooks/useCommunityConfig";
import ErrorComponent from "src/ui/ErrorComponent";
import Check from "src/ui/Check";
import { PlusIcon } from "assets";
import Animated, { FadeInDown } from "react-native-reanimated";
import SmallLoadingComponent from "src/ui/SmallLoadingComponent";

const { width } = Dimensions.get("window");

export const LIMIT = 10;

function MembersList() {
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState([]);
  const [isLoadingMoreData, setIsLoadingMoreData] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(10);
  const { loading: configLoading, config } = useCommunityConfig();

  const renderItem = ({ item }: { item: Member }) => {
    return <MemberItem member={item} />;
  };
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const isSuperAdmin = currentUser?.isSuperAdmin;

  const {
    data: membersData,
    loading,
    error,
    request: fetchCommunityMembersForCommunityId,
  } = useApi(getCommunityMembersForCommunityId);

  const router = useRouter();

  const shouldOnlyShowFamilyHeads = config?.features?.ShowOnlyHeadsInAllMembers;

  // console.log("config", config);

  const filters = {
    isAccountManager: true,
  };

  React.useEffect(() => {
    (async () => {
      if (communityId && !loading) {
        if (currentPage > 1) {
          setIsLoadingMoreData(true);

          await fetchCommunityMembersForCommunityId(
            communityId,
            (currentPage - 1) * LIMIT,
            LIMIT,
            "",
            filters
          );
          setIsLoadingMoreData(false);
        }
      }
    })();
  }, [currentPage, communityId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCommunityMembersForCommunityId(
        communityId,
        (currentPage - 1) * LIMIT,
        LIMIT,
        "",
        filters
      );
    }, [])
  );

  React.useEffect(() => {
    if (isEmpty(membersData?.members?.rows)) {
      return;
    }
    setTotalPages(Math.ceil(membersData?.members?.count / LIMIT));
    const newData = data;

    // unique users
    forEach(membersData?.members?.rows, (member) => {
      const length = filter(data, (d) => d?.id === member?.id)?.length;
      if (length === 0) {
        newData?.push(member);
      }
    });
    dispatch(
      setCommunity({
        ...selectedCommunity,
        totalMembers: membersData?.totalMembers,
        totalFamilyHeads: membersData?.members?.count,
      })
    );
    setData(newData);
  }, [membersData]);

  if (error) {
    return <ErrorComponent />;
  }

  if ((loading || configLoading) && isEmpty(data)) {
    return <LoadingComponent />;
  }

  if (!loading && isEmpty(data)) {
    return <NoDataComponent />;
  }

  let callOnScrollEnd = false;

  const loadMoreData = () => {
    if (currentPage < totalPages) {
      setCurrentPage((c) => {
        const totalMembers = data?.length;
        if (totalMembers === c * LIMIT) {
          return c + 1;
        } else {
          return c;
        }
      });
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={{ backgroundColor: "white", flex: 1, position: "relative" }}>
      <Check ifPresent={isSuperAdmin}>
        <TouchableOpacity
          hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
          onPress={() => {
            router.push({
              pathname: "/add-member",
            });
          }}
          style={{
            zIndex: 1000,
            position: "absolute",
            bottom: 0,
            right: width / 2 - 22,
            borderRadius: 999,
          }}>
          <PlusIcon fill="#0777FF" width={42} height={42} />
        </TouchableOpacity>
      </Check>

      <FlatList
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        data={data}
        ListEmptyComponent={() => (
          <NoDataComponent subtitle="Looks like there is no member in this community at the moment." />
        )}
        style={{ backgroundColor: "rgb(231, 240, 244)", paddingTop: 12 }}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMoreData ? <SmallLoadingComponent /> : null
        }
        keyExtractor={(item) => item?.id}
        onEndReached={() => (callOnScrollEnd = true)}
        onMomentumScrollEnd={() => {
          callOnScrollEnd && loadMoreData();
          callOnScrollEnd = false;
        }}
        initialNumToRender={10}
      />
    </Animated.View>
  );
}

export default React.memo(MembersList);
