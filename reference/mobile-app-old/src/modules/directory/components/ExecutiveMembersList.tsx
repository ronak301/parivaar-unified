import { View, FlatList } from "react-native";
import React from "react";
import { useTheme } from "../../../ui";
import { Member } from "src/types/types";
import MemberItem from "../components/MemberItem";
import { filter, isEmpty } from "lodash";
import { useApi } from "src/api/useApi";
import { getCommunityDetailsForId } from "src/api/directoryApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { setCommunity } from "../redux/communitySlice";
import LoadingComponent from "src/ui/LoadingComponent";
import Animated, { FadeInDown } from "react-native-reanimated";
import NoDataComponent from "src/ui/NoDataComponent";

export default function ExecutiveMembersList() {
  const { colors } = useTheme();

  const [data, setData] = React.useState([]);

  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const dispatch = useDispatch();

  const selectedCommunityId = selectedCommunity?.id;

  const { loading, request } = useApi(getCommunityDetailsForId);

  React.useEffect(() => {
    (async () => {
      if (isEmpty(data)) {
        const res = await request(selectedCommunityId);

        setData(res?.data);
        dispatch(
          setCommunity({
            ...selectedCommunity,
            ...res?.data,
          })
        );
      }
    })();
  }, [selectedCommunityId]);

  const getOrderedList = (list) => {
    if (list?.length <= 1) return list;
    var listCopy = [...list];
    const ExecutivesPostOrder = [
      "अध्यक्ष",
      "मंत्री",
      "उपाध्यक्ष",
      "सहमंत्री",
      "कोषाध्यक्ष",
      "संगठन मंत्री",
    ];
    listCopy?.sort((r1, r2) => {
      const type1 = r1?.executive?.roles?.[0];
      const type2 = r2?.executive?.roles?.[0];

      if (type1 === type2) return 0;

      for (var i = 0; i < ExecutivesPostOrder?.length; i++) {
        const o = ExecutivesPostOrder[i];
        if (type1 === o) {
          return -1;
        }
        if (type2 === o) {
          return 1;
        }
      }
    });

    return listCopy;
  };

  const filteredList = filter(data?.executives, (e) => {
    const filtersWithoutAdmin = filter(
      e?.executive?.roles,
      (r) => r !== "ADMIN"
    );
    return filtersWithoutAdmin?.length >= 1;
  });

  const orderedList = getOrderedList(filteredList);

  const renderItem = ({ item }: { item: Member }) => {
    return <MemberItem member={item} as="executive" />;
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (!loading && isEmpty(orderedList)) {
    return <NoDataComponent />;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={orderedList}
        keyboardShouldPersistTaps="always"
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 300 }}
        style={{ backgroundColor: "rgb(231, 240, 244)", paddingTop: 4 }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: colors?.border,
            }}
          />
        )}
      />
    </Animated.View>
  );
}
