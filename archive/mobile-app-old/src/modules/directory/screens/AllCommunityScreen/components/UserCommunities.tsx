import { StatusBar, FlatList } from "react-native";
import React from "react";
import CommunityItem from "./CommunityItem";
import NoDataComponent from "src/ui/NoDataComponent";
import SeperatorComponent from "src/ui/SeperatorComponent";
import { useApi } from "src/api/useApi";
import { getUserCommunities } from "src/api/directoryApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { Text, normalize } from "src/ui/Text";
import LoadingComponent from "src/ui/LoadingComponent";
import UpdateAvailable from "./UpdateAvailable";
import { isEmpty } from "lodash";
import { setAllCommunities } from "src/modules/directory/redux/communitySlice";
import { useRouter } from "expo-router";

const UserCommunities = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const allCommunities = useSelector(
    (state: RootState) => state?.community?.allCommunities
  );
  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  const { request: fetchUsercommunities } = useApi(getUserCommunities);

  const currentSelectedCommunity = useSelector(
    (state: RootState) => state.community.selectedCommunity
  );

  React.useEffect(() => {
    if (currentSelectedCommunity?.id)
      router.push({
        pathname: `/(authenticated)/community/${currentSelectedCommunity?.id}`,
      });
  }, []);

  React.useEffect(() => {
    (async () => {
      if (currentUser?.id) {
        try {
          const data = await fetchUsercommunities(currentUser?.id);
          dispatch(setAllCommunities(data?.data?.data?.communities));
        } catch (err) {}
      }
    })();
  }, [currentUser]);

  const renderItem = ({ item }) => {
    return <CommunityItem item={item} />;
  };

  if (isEmpty(allCommunities)) {
    return <LoadingComponent />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <FlatList
        style={{ backgroundColor: "white" }}
        data={allCommunities}
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
                marginTop: 24,
                fontSize: 18,
                marginBottom: 0,
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

export default UserCommunities;
