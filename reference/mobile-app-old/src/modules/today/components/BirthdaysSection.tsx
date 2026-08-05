import { View } from "react-native";
import React from "react";
import { useApi } from "src/api/useApi";
import { getAllTodaysBirthdays } from "src/api/directoryApi";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { filter, isEmpty } from "lodash";
import LoadingComponent from "src/ui/LoadingComponent";
import NoDataComponent from "src/ui/NoDataComponent";
import { Text } from "src/ui/Text";
import BirthdayWishCard from "./BirthdayWishCard";
import FlatList from "src/ui/FlatList";
import LottieView from "lottie-react-native";

const BirthdaysSection = () => {
  const {
    data: allBirthdays,
    loading,
    request: fetchAllTodaysBirthdays,
  } = useApi(getAllTodaysBirthdays);

  const animation = React.useRef(null);

  function isToday(dob) {
    if (isEmpty(dob)) return false;
    const dateOfBirth = new Date(dob);
    const today = new Date();

    if (
      today.getDate() === dateOfBirth.getDate() &&
      today.getMonth() === dateOfBirth.getMonth()
    ) {
      return true;
    }
    return false;
  }

  const [data, setData] = React.useState<any>([]);
  const currentCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  React.useEffect(() => {
    fetchAllTodaysBirthdays(currentCommunity?.id);
  }, []);

  React.useEffect(() => {
    const filteredBirthdays = filter(allBirthdays?.data, (user) => {
      return isToday(user?.dob);
    });

    const sortedBirthdays = filteredBirthdays?.sort((u1, u2) => {
      // console.log("u1?.profilePictureu1?.profilePicture", u1?.profilePicture);
      if (u1?.profilePicture === null) {
        return 1;
      } else {
        return -1;
      }
    });

    setData(sortedBirthdays);
  }, [allBirthdays]);

  if (isEmpty(data) && loading) {
    return <LoadingComponent />;
  }

  if (isEmpty(data)) {
    return <NoDataComponent title="No Birthdays today" subtitle="" />;
  }

  const initiateCelebrationAnimation = () => {
    animation?.current?.play();
  };

  return (
    <View style={{ paddingBottom: 0, backgroundColor: "white" }}>
      <FlatList
        ListHeaderComponent={
          <Text
            bold
            style={{
              fontSize: 18,
              paddingHorizontal: 16,
              paddingTop: 32,
              paddingBottom: 16,
            }}>{`We have ${data?.length} Birthdays Today`}</Text>
        }
        style={{
          paddingHorizontal: 8,
        }}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 32,
        }}
        data={data}
        renderItem={({ item }) => (
          <BirthdayWishCard
            initiateCelebrationAnimation={initiateCelebrationAnimation}
            user={item}
          />
        )}
      />
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}>
        <LottieView
          ref={animation}
          loop={false}
          style={{
            width: "100%",
            height: "100%",
          }}
          source={require("assets/celebrate.json")}
        />
      </View>
    </View>
  );
};

export default BirthdaysSection;
