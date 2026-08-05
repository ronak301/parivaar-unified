import React from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import MembersList from "../components/MembersList";
import ExecutiveMembersList from "../components/ExecutiveMembersList";

import {
  SceneMap,
  SceneRendererProps,
  TabBar,
  TabView,
} from "react-native-tab-view";

import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { BackButton } from "src/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { Image } from "expo-image";
import { Text } from "src/ui/Text";
import SearchIconCtr from "./MemberDetails/components/SearchIconCtr";
import CommunityDetailsScreen from "./CommunityDetailsScreen/CommunityDetailsScreen";
import TodayScreen from "src/modules/today/screens/TodayScreen";
import MatrimonialTab from "src/modules/matrimonial/screens/MatrimonialTab";
import { getTodayDateKey } from "src/utils/utils";
import * as Haptics from "expo-haptics";

function DirectoryScreen() {
  const { tab } = useLocalSearchParams();
  const initialTab = tab === "Today" ? 1 : 2;
  const [index, setIndex] = React.useState(initialTab);

  const navigation = useNavigation();
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const layout = useWindowDimensions();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "black",
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      header: () => {
        return (
          <View
            style={{
              height: 104,
              width: "100%",
              backgroundColor: "black",
              paddingHorizontal: 16,
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginTop: 44,
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}>
                <BackButton />
                <View style={{ marginLeft: 12 }}>
                  {!!selectedCommunity?.name ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                      }}>
                      <Image
                        style={{ width: 28, height: 28, borderRadius: 8 }}
                        source={{ uri: selectedCommunity?.logo }}
                      />
                      <View
                        style={{
                          marginLeft: 8,
                        }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}>
                          <Text
                            style={{
                              color: "white",
                              fontSize: 14,
                              fontFamily: "poppins",
                              width: 200,
                            }}>
                            {selectedCommunity?.name}
                          </Text>
                          {/* <Ionicons
                            name="chevron-forward-outline"
                            size={12}
                            color="white"
                          /> */}
                        </View>
                        {/* <Check ifPresent={selectedCommunity?.totalFamilyHeads}>
                          <Text
                            style={{
                              fontSize: 10,
                              color: "#EBE4E4",
                              fontWeight: "400",
                              fontFamily: "poppins",
                            }}>{`${selectedCommunity?.totalFamilyHeads} Families`}</Text>
                        </Check> */}
                      </View>
                    </View>
                  ) : (
                    <ActivityIndicator />
                  )}
                </View>
              </View>
              <SearchIconCtr />
            </View>
          </View>
        );
      },
    });
  }, [selectedCommunity]);

  const renderScene = SceneMap({
    about: CommunityDetailsScreen,
    today: TodayScreen,
    all: MembersList,
    executive: ExecutiveMembersList,
    matrimonial: MatrimonialTab,
  });

  const [routes] = React.useState([
    { key: "about", title: "About Community" },
    { key: "today", title: "Today" },
    { key: "all", title: "All Members" },
    { key: "executive", title: "Committee" },
    { key: "matrimonial", title: "Matrimonial" },
  ]);

  const renderTabBar = (
    props: SceneRendererProps & {
      navigationState: any;
    }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#0777FF", height: 4 }}
      scrollEnabled={true}
      style={{
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
      tabStyle={{ width: "auto" }}
      activeColor={"#0777FF"}
      inactiveColor={"#646464"}
      labelStyle={{
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
      }}
    />
  );

  // console.log("getTodayDateKeygetTodayDateKey", getTodayDateKey());

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={(id: number) => {
        Haptics?.selectionAsync();
        setIndex(id);
      }}
      overScrollMode="never"
      initialLayout={{ width: layout.width }}
      swipeEnabled
      lazy
      renderTabBar={renderTabBar}
    />
  );
}

export default React.memo(DirectoryScreen);
