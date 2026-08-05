import { Dimensions, TouchableOpacity, View } from "react-native";
import React from "react";
import { Member } from "src/types/types";
import LoadingComponent from "src/ui/LoadingComponent";
import NoDataComponent from "src/ui/NoDataComponent";
import FlatList from "src/ui/FlatList";
import { useApi } from "src/api/useApi";
import { getCommunityMembersForCommunityId } from "src/api/directoryApi";
import { filter, forEach, isEmpty } from "lodash";
import SmallLoadingComponent from "src/ui/SmallLoadingComponent";
import { Text } from "src/ui/Text";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { useRouter } from "expo-router";
import ErrorComponent from "src/ui/ErrorComponent";
import MemberItem from "src/modules/directory/components/MemberItem";

const { width } = Dimensions.get("window");

export const LIMIT = 1000;

function Matrimonial({ gender = "Male" }) {
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [data, setData] = React.useState([]);
  const [isLoadingMoreData, setIsLoadingMoreData] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(10);

  const renderItem = ({ item }: { item: Member }) => {
    return <MemberItem member={item} />;
  };

  const {
    data: membersData,
    loading,
    error,
    request: fetchCommunityMembersForCommunityId,
  } = useApi(getCommunityMembersForCommunityId);

  const router = useRouter();

  React.useEffect(() => {
    if (currentPage === 1) {
      fetchCommunityMembersForCommunityId(
        communityId,
        (currentPage - 1) * LIMIT,
        LIMIT,
        "",
        {
          gender,
          isMarried: false,
          age: {
            max: 35,
            min: 21,
          },
        }
      );
    }
  }, [currentPage]);

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
            {
              gender,
              isMarried: false,
              age: {
                max: 35,
                min: 21,
              },
            }
          );
          setIsLoadingMoreData(false);
        }
      }
    })();
  }, [currentPage, communityId]);

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
    setData(newData);
  }, [membersData]);

  if (error) {
    return <ErrorComponent />;
  }

  if (loading && isEmpty(data)) {
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

  const totalRows = membersData?.members?.count;

  return (
    <View style={{ backgroundColor: "white", flex: 1, position: "relative" }}>
      <FlatList
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        data={data}
        ListEmptyComponent={() => (
          <NoDataComponent subtitle="Looks like there is no member in this community at the moment." />
        )}
        ListHeaderComponent={() => (
          <>
            <Text
              style={{
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 4,
                fontSize: 12,
              }}>
              {`Age - 21 to 35`}
            </Text>
            <Text
              bold
              style={{
                paddingHorizontal: 16,
                paddingBottom: 8,
                fontSize: 14,
              }}>
              {`Showing ${totalRows} candidates`}
            </Text>
          </>
        )}
        style={{ backgroundColor: "rgb(231, 240, 244)", paddingTop: 4 }}
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
    </View>
  );
}

export default React.memo(Matrimonial);
