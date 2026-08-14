import {
  Alert,
  Image as RNImage,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Text } from "src/ui/Text";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { captureRef } from "react-native-view-shot";
import { Button } from "src/ui/Button";
import * as MediaLibrary from "expo-media-library";
import * as Sentry from "sentry-expo";
import Share from "react-native-share";
import { useTheme } from "src/ui";
import { DownloadIcon, WhatsappShareIcon } from "assets";
import { storage } from "src/config/firebaseConfig";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import LoadingComponent from "src/ui/LoadingComponent";
import { map } from "lodash";
import { sendEvent } from "src/api/events";
import Check from "src/ui/Check";
import { getTodayDateKey } from "src/utils/utils";
import { setDailyStatus } from "../redux/today";

const USER_IMAGE_HEIGHT = 80;
const ASPECT_RATIO = 0.71;

const StatusSection = () => {
  const { width } = useWindowDimensions();

  const IMAGE_HEIGHT = width * ASPECT_RATIO;
  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );
  const currentLoggedInUser = currentUser;

  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [singleImageUrl, setSingleImageUrl] = React.useState("");

  const imageRef = React.useRef();

  const key = getTodayDateKey();
  const todaysStatus = useSelector(
    (state: RootState) => state?.today?.dailyStatus
  )?.[key];

  const shareOnWhatsapp = async () => {
    try {
      sendEvent(
        `Share daily status clicked by ${currentLoggedInUser?.firstName} ${currentLoggedInUser?.lastName} (${currentLoggedInUser?.phone})`
      );
      const localUri = await captureRef(imageRef, {
        height: IMAGE_HEIGHT,
        quality: 1,
      });

      const shareOptions = {
        title: "Terapanth Sabha Udaipur, Digital Directory App - Parivaar",
        message: "Terapanth Sabha Udaipur, Digital Directory App - Parivaar",
        url: localUri,
        social: Share.Social.WHATSAPP,
      };

      Share.shareSingle(shareOptions)
        .then((res) => {
          // console.log(res);
        })
        .catch((err) => {
          Sentry.Native.captureException(err);
          err && console.log(err);
        });
    } catch (err) {
      Sentry.Native.captureException(err);
    }
  };

  const onSaveImageAsync = async () => {
    sendEvent(
      `Download daily status clicked by ${currentLoggedInUser?.firstName} ${currentLoggedInUser?.lastName} (${currentLoggedInUser?.phone})`
    );
    const { granted } = await MediaLibrary.getPermissionsAsync(true);
    if (!granted) await MediaLibrary.requestPermissionsAsync(true);

    try {
      const localUri = await captureRef(imageRef, {
        height: IMAGE_HEIGHT,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        Alert.alert("Photo Saved to gallery!");
      }
    } catch (e) {
      Sentry.Native?.captureException(e);
    }
  };

  const listRef = ref(storage, "status");

  React.useEffect(() => {
    (async () => {
      if (!todaysStatus) {
        listAll(listRef).then((res) => {
          const images = map(res?.items, (i) => i?._location?.path_);
          const totalImages = images?.length;
          const generatedRandomNumber = Math.floor(Math.random() * totalImages);
          dispatch(
            setDailyStatus({
              [key]: images[generatedRandomNumber],
            })
          );
        });
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!todaysStatus) return;
    (async () => {
      getDownloadURL(ref(storage, todaysStatus))
        .then((url) => {
          setSingleImageUrl(url);
        })
        .catch((error) => {
          Sentry.Native.captureException(error);
        });
    })();
  }, [todaysStatus]);

  if (!singleImageUrl) {
    return <LoadingComponent />;
  }

  return (
    <View style={{ marginTop: 32, paddingBottom: 24 }}>
      <Text
        bold
        style={{
          fontSize: 16,
          textAlign: "center",
          paddingBottom: 8,
          paddingTop: 4,
        }}>
        आज का सुविचार
      </Text>
      <Text
        style={{
          fontSize: 13,
          textAlign: "center",
          paddingBottom: 16,
          paddingTop: 4,
          paddingHorizontal: 16,
          fontFamily: null,
        }}>
        व्हाट्सएप स्टेटस पर लगाने के लिए नीचे शेयर बटन पर क्लिक करें
      </Text>
      <Check ifPresent={!currentUser?.profilePicture}>
        <Text
          style={{
            fontSize: 13,
            textAlign: "center",
            paddingBottom: 8,
            paddingTop: 2,
            paddingHorizontal: 16,
            fontFamily: null,
          }}>
          कृपया अपना प्रोफाइल पिक्चर अपडेट करें
        </Text>
      </Check>

      <View ref={imageRef} collapsable={false}>
        {singleImageUrl ? (
          <Image
            source={{
              uri: singleImageUrl,
            }}
            style={{
              width,
              height: width * ASPECT_RATIO,
              resizeMode: "contain",
            }}
          />
        ) : null}

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: currentUser?.profilePicture ? 8 : 0,
            flexDirection: "row",
          }}>
          <Check ifPresent={currentUser?.profilePicture}>
            <RNImage
              source={{
                uri: currentUser?.profilePicture,
              }}
              style={{
                width: USER_IMAGE_HEIGHT,
                height: USER_IMAGE_HEIGHT,
                borderRadius: 8,
                borderColor: "white",
                borderWidth: 4,
              }}
            />
          </Check>

          <View
            style={{
              alignSelf: "flex-end",
              width: "100%",
              height: USER_IMAGE_HEIGHT / 2,
              backgroundColor: "black",
              justifyContent: "center",
            }}>
            <Text
              bold
              style={{
                paddingLeft: 16,
                color: "white",
                fontSize: 16,
                paddingTop: 4,
              }}>
              {`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`}
            </Text>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 6,
            alignItems: "center",
            backgroundColor: "white",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderTopLeftRadius: 999,
            borderBottomLeftRadius: 999,
            flexDirection: "row",
            borderColor: colors?.borderDark,
            borderWidth: 1,
          }}>
          <Image
            source={require("assets/favicon.png")}
            style={{ height: 14, width: 14, borderRadius: 999 }}
          />
          <Text bold style={{ fontSize: 8, marginLeft: 4 }}>
            Terapanth Sabha Udaipur
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 16,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        {/* <Button
          variant="outline"
          title="Download"
          onPress={onSaveImageAsync}
          style={{ width: "47%" }}
          iconPlacement="left"
          icon={<DownloadIcon />}
        /> */}
        <Button
          title="Share"
          onPress={shareOnWhatsapp}
          style={{ width: "100%" }}
          iconPlacement="left"
          icon={<WhatsappShareIcon width={22} height={20} />}
        />
      </View>
    </View>
  );
};

export default StatusSection;
