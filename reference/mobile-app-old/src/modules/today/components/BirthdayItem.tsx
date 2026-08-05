import {
  Alert,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Text } from "src/ui/Text";
import Check from "src/ui/Check";
import { Button } from "src/ui/Button";
import { DownloadIcon, WhatsappShareIcon } from "assets";
import { sendEvent } from "src/api/events";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import * as Sentry from "sentry-expo";
import { useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";

const BirthdayItem = ({ user }) => {
  const { width } = useWindowDimensions();
  const imageSize = width * 0.85;
  const imageRef = React.useRef();
  const router = useRouter();

  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  const shareOnWhatsapp = async () => {
    try {
      sendEvent(
        `Share birthday clicked by ${currentUser?.firstName} ${currentUser?.lastName} (${currentUser?.phone}) - for ${user?.firstName} (${user?.phone})`
      );
      const localUri = await captureRef(imageRef, {
        height: imageSize,
        quality: 1,
      });

      const shareOptions = {
        title: "",
        message: "",
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
      `Download birthday post by ${currentUser?.firstName} ${currentUser?.lastName} (${currentUser?.phone}) for ${user?.firstName} (${user?.phone})`
    );
    const { granted } = await MediaLibrary.getPermissionsAsync(true);
    if (!granted) await MediaLibrary.requestPermissionsAsync(true);

    try {
      const localUri = await captureRef(imageRef, {
        height: imageSize,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        Alert.alert("Birthday Post Saved to gallery!");
      }
    } catch (e) {
      Sentry.Native?.captureException(e);
    }
  };

  return (
    <View
      style={{
        height: 220,
        position: "relative",
        marginTop: 0,
        width,
        alignItems: "center",
      }}>
      <TouchableOpacity
        onPress={() => {
          setTimeout(() => {
            router.push(`/member/${user?.id}`);
          }, 0);
        }}
        ref={imageRef}
        style={{ alignItems: "center", borderRadius: 8 }}>
        <Image
          style={{ width: imageSize, height: imageSize }}
          source={require("assets/birthdayTemplate.png")}
        />
        <View
          style={{
            position: "absolute",
            top: user?.profilePicture ? "30%" : "40%",
          }}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Check ifPresent={user?.profilePicture}>
              <Image
                source={{
                  uri: user?.profilePicture,
                }}
                style={{
                  marginTop: 12,
                  marginBottom: 12,
                  width: width * 0.16,
                  height: width * 0.16,
                  borderRadius: 8,
                  borderColor: "white",
                  borderWidth: 2,
                }}
              />
            </Check>

            <View>
              <Text
                bold
                numberOfLines={2}
                style={{
                  color: "white",
                  fontSize: user?.profilePicture ? 16 : 20,
                  textAlign: "center",
                }}>{`${user?.firstName} Ji ${user?.lastName || ""}`}</Text>
              <Text
                bold
                style={{
                  marginTop: 8,
                  fontFamily: null,
                  color: "rgb(220,152,190)",
                  fontSize: 14,
                  textAlign: "center",
                }}>{`आपश्री को जन्मादिन की`}</Text>
              <Text
                bold
                style={{
                  fontFamily: null,
                  color: "rgb(253,252,253)",
                  fontSize: 18,
                  textAlign: "center",
                }}>{`हार्दिक बधाई, शुभकामनाएँ`}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: "84%",
            alignItems: "center",
          }}>
          <Text bold style={{ paddingTop: 2, fontSize: 14, color: "white" }}>
            श्री जैन श्वेताम्बर तेरापंथी सभा, उदयपुर
          </Text>
        </View>
      </TouchableOpacity>
      <View
        style={{
          marginTop: 32,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <Button
          variant="outline"
          title="Download"
          onPress={onSaveImageAsync}
          style={{ width: "47%", marginRight: 4 }}
          iconPlacement="left"
          icon={<DownloadIcon />}
        />
        <Button
          onPress={shareOnWhatsapp}
          style={{ width: "47%", marginLeft: 4 }}
          title="Share"
          iconPlacement="left"
          icon={<WhatsappShareIcon width={22} height={20} />}
        />
      </View>
    </View>
  );
};

export default BirthdayItem;
