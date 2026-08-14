import { View, useWindowDimensions, TouchableOpacity } from "react-native";
import React from "react";
import { Text } from "src/ui/Text";
import { useTheme } from "src/ui";
import { capitalize, includes } from "lodash";
import MemberImage from "src/ui/MemberImage";
import { useRouter } from "expo-router";
import { getAge, getTodayDateKey } from "src/utils/utils";
import LottieView from "lottie-react-native";
import * as Burnt from "burnt";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { addTodaysBirthdayWishedIds } from "../redux/today";
import { wishBirthday } from "src/api/directoryApi";
import { Button } from "src/ui/Button";
import Toast from "react-native-toast-message";

const BirthdayWishCard = ({ user, initiateCelebrationAnimation }) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const router = useRouter();
  const animation = React.useRef(null);
  const [hasWished, setHasWished] = React.useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );
  const currentCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const dailyBirthdayWishedIds =
    useSelector(
      (state: RootState) =>
        state?.today?.dailyBirthdayWishedIds[getTodayDateKey()]
    ) || [];

  const alreadyWishedToThisUser = includes(dailyBirthdayWishedIds, user?.id);

  React.useEffect(() => {
    animation?.current?.play();
  }, [alreadyWishedToThisUser]);

  React.useEffect(() => {
    if (hasWished) {
      animation?.current?.play();
      Toast.show({
        position: "top",
        type: "success",
        text1: `Wished Happy Birthday to ${user?.firstName} Ji`,
        text2: "",
      });
      // setTimeout(() => {
      //   initiateCelebrationAnimation();
      // }, 2000);

      // setTimeout(() => {
      //   Burnt.alert({
      //     title: "Success!", // required

      //     preset: "done", // or "error", "heart", "custom"

      //     message: `You have wished Happy Birthday to ${user?.firstName} ${user?.lastName}`, // optional

      //     duration: 4,

      //     // optionally customize layout
      //     layout: {
      //       iconSize: {
      //         height: 24,
      //         width: 24,
      //       },
      //     },
      //     icon: {
      //       ios: {
      //         // SF Symbol. For a full list, see https://developer.apple.com/sf-symbols/.
      //         name: "checkmark.seal",
      //         color: "#1D9BF0",
      //       },
      //     },
      //   });
      // }, 5000);
    }
  }, [hasWished]);

  return (
    <TouchableOpacity
      onPress={() => {
        setTimeout(() => {
          router.push(`/member/${user?.id}`);
        }, 0);
      }}
      style={{
        flex: 1,
        height: 240,
        backgroundColor: "white",
        width: width / 2 - 24,
        borderColor: "rgba(0,0,0,0.20)",
        borderWidth: 0,
        marginHorizontal: 8,
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: "center",
        paddingTop: 16,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}>
      <MemberImage
        url={user?.profilePicture}
        initials={[user?.firstName, user?.lastName]}
        style={{ width: 100, height: 100 }}
        as={"normal"}
      />
      <Text
        bold
        style={{
          textAlign: "center",
          color: "black",
          marginTop: 8,

          paddingTop: 4,
          fontSize: 14,
        }}>{`${capitalize(user?.firstName)} ${capitalize(
        user?.lastName
      )}`}</Text>
      <Text
        style={{
          textAlign: "center",
          fontFamily: null,
          paddingTop: 4,
          fontSize: 12,
          color: colors.textLight,
        }}>{`${getAge(user?.dob)} years old`}</Text>
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          alignItems: "center",
          // backgroundColor: "green",
        }}>
        {hasWished || alreadyWishedToThisUser ? (
          <LottieView
            ref={animation}
            style={{
              width: 60,
              height: 50,
              justifyContent: "flex-end",
            }}
            source={require("assets/checkmark.json")}
            loop={false}
          />
        ) : (
          <Button
            onPress={() => {
              const to = user?.id;
              const from = currentUser?.id;
              wishBirthday(to, from, currentCommunity?.id);
              const wishedUserIds = [...dailyBirthdayWishedIds, user?.id];
              const key = getTodayDateKey();
              setHasWished(true);
              dispatch(addTodaysBirthdayWishedIds({ [key]: wishedUserIds }));
            }}
            title="Say Happy Birthday"
            variant="outline"
            style={{ paddingHorizontal: 4 }}
            size="md"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BirthdayWishCard;
