import React from "react";
import { useFocusEffect, useNavigation } from "expo-router";
import Header from "./Header";
import { SearchContextProvider } from "./hooks/useSearch";
import { useApi } from "src/api/useApi";
import { getCommunityMembersForCommunityId } from "src/api/directoryApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import SearchResultList from "./components/SearchResultList";
import { useDebounce } from "use-debounce";
import {
  removeFilter,
  setShouldReloadSearchResults,
} from "./redux/searchSlice";
import { View } from "react-native";
import { Text } from "src/ui/Text";
import { Switch } from "react-native";

const SearchScreen = () => {
  const navigation = useNavigation();

  const query = useSelector((state: RootState) => state?.search?.query);
  const [debouncedText] = useDebounce(query?.replace(/\s/g, "").trim(), 500);

  const searchFilter = useSelector((state: RootState) => state?.search?.filter);

  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const dispatch = useDispatch();
  const [showOnlyMukhiya, setShowOnlyMukhiya] = React.useState<
    boolean | undefined
  >(undefined);

  React.useEffect(() => {
    return () => {
      dispatch(removeFilter());
    };
  }, []);

  const shouldReloadSearchResults = useSelector(
    (state: RootState) => state?.search?.shouldReloadResults
  );

  const {
    data: membersData,
    loading,
    request: fetchCommunityMembersForCommunityId,
  } = useApi(getCommunityMembersForCommunityId);

  // console.log("membersData", membersData?.members?.rows?.length);

  const updatedFilters = {
    bloodGroup: searchFilter?.bloodGroup?.id,
    locality: searchFilter?.locality,
    businessType: searchFilter?.businessType,
    showUnmarried: searchFilter?.showUnmarried,
    age: searchFilter?.age,
    gender: searchFilter?.gender,
  };

  const removedFalsyValuesFromFilter = Object.fromEntries(
    Object.entries(updatedFilters).filter(([_, v]) => v != null)
  );

  const finalFilters = {
    isAccountManager: showOnlyMukhiya ? true : false,
    ...(removedFalsyValuesFromFilter?.bloodGroup && {
      bloodGroup: removedFalsyValuesFromFilter?.bloodGroup,
    }),
    ...(removedFalsyValuesFromFilter?.locality && {
      address: {
        locality: removedFalsyValuesFromFilter?.locality,
      },
    }),
    ...(removedFalsyValuesFromFilter?.businessType && {
      business: {
        type: removedFalsyValuesFromFilter?.businessType,
      },
    }),
    ...(removedFalsyValuesFromFilter?.showUnmarried && {
      weddingDate: null,
    }),
    ...(removedFalsyValuesFromFilter?.age && {
      age: removedFalsyValuesFromFilter?.age,
    }),
    ...(removedFalsyValuesFromFilter?.gender && {
      gender: removedFalsyValuesFromFilter?.gender,
    }),
  };

  // React.useEffect(() => {
  //   fetchCommunityMembersForCommunityId(
  //     selectedCommunity?.id,
  //     searchFilter?.skip,
  //     searchFilter?.limit,
  //     debouncedText,
  //     finalFilters
  //   );
  //   dispatch(setShouldReloadSearchResults(false));
  // }, [shouldReloadSearchResults]);

  React.useEffect(() => {
    fetchCommunityMembersForCommunityId(
      selectedCommunity?.id,
      searchFilter?.skip,
      searchFilter?.limit,
      debouncedText,
      finalFilters
    );
  }, [debouncedText, searchFilter, showOnlyMukhiya, shouldReloadSearchResults]);

  const [members, setMembers] = React.useState([]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "#000000",
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      header: () => {
        return (
          <SearchContextProvider members={members} setMembers={setMembers}>
            <Header />
          </SearchContextProvider>
        );
      },
    });
  });

  return (
    <>
      <View
        style={{
          backgroundColor: "rgb(231, 240, 244)",
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 48,
          borderBottomColor: "rgb(200,200,200)",
          borderBottomWidth: 1,
        }}>
        <Text style={{ paddingTop: 4 }}>Show Only Family Head</Text>
        <Switch
          trackColor={{ false: "rgb(100,100,100)", true: "#0777FF" }}
          thumbColor={"white"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={(val) => setShowOnlyMukhiya(!!val ? true : undefined)}
          value={showOnlyMukhiya}
        />
      </View>
      <SearchResultList
        loading={loading}
        data={membersData?.members?.rows}
        count={membersData?.members?.count}
      />
    </>
  );
};

export default SearchScreen;
