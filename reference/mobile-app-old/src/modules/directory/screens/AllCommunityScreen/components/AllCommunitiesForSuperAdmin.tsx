import { StatusBar, FlatList, View } from "react-native";
import React from "react";
import CommunityItem from "./CommunityItem";
import NoDataComponent from "src/ui/NoDataComponent";
import SeperatorComponent from "src/ui/SeperatorComponent";
import { getAllCommunities } from "src/api/directoryApi";
import { useApi } from "src/api/useApi";
import { Text } from "src/ui/Text";
import LoadingComponent from "src/ui/LoadingComponent";
import UpdateAvailable from "./UpdateAvailable";

const AllCommunitiesForSuperAdmin = () => {
  const {
    data: communities,
    request: fetchAllcommunities,
    loading,
  } = useApi(getAllCommunities);

  React.useEffect(() => {
    try {
      fetchAllcommunities();
    } catch (err) {
      // console.log("Error - ", err?.message);
    }
  }, []);

  const renderItem = ({ item }) => {
    return <CommunityItem item={item} />;
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <FlatList
        style={{ backgroundColor: "white" }}
        data={communities?.communities}
        ListEmptyComponent={() => <NoDataComponent />}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <SeperatorComponent />}
        ListHeaderComponent={
          <>
            <UpdateAvailable />
            <Text
              bold
              style={{
                paddingLeft: 16,
                marginTop: 16,
                fontSize: 18,
                marginBottom: 8,
                fontWeight: "600",
              }}>
              My Communities
            </Text>
          </>
        }
      />
    </>
  );
};

export default AllCommunitiesForSuperAdmin;
