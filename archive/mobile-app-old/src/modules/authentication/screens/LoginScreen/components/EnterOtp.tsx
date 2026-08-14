import {
  View,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import React from "react";
import { useTheme } from "src/ui";
import { Button } from "src/ui/Button";
import { useRouter } from "expo-router";
import { useApi } from "src/api/useApi";
import { useDispatch } from "react-redux";
import {
  setAccessToken,
  setUser,
} from "src/modules/authentication/redux/authSlice";
import { Text } from "src/ui/Text";
import { getMemberDetails } from "src/api/directoryApi";
import * as Sentry from "sentry-expo";
import { sendEvent } from "src/api/events";
import { verifyOtp } from "src/api/authApi";
import {
  mockOtpLoginUserId,
  testAccessToken,
  usesMockOtpSession,
} from "src/modules/authentication/utils/authUtils";

const EnterOtp = ({ phone, setOtpSent }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const [text, setText] = React.useState("");
  const { request: getMemberDetailsApi } = useApi(getMemberDetails);

  const onLogin = async () => {
    setLoading(true);

    const useMock = usesMockOtpSession(phone, text);
    let data: { data?: { jwt?: string; userId?: string } } | undefined;
    if (!useMock) {
      ({ data } = await verifyOtp(phone, text));
    }

    const accessToken = useMock ? testAccessToken : data?.data?.jwt;
    const userId = useMock ? mockOtpLoginUserId(phone, text) : data?.data?.userId;
    const { data: currentFullUser } = await getMemberDetailsApi(userId);
    const user = currentFullUser?.data;

    dispatch(setAccessToken(accessToken));
    dispatch(setUser(user));

    if (accessToken) {
      Sentry.Native.setUser({
        id: user?.id,
        phone,
        name: user?.firstName,
      });

      sendEvent(`New Login - ${phone} ${user?.firstName} ${user?.lastName}`);
      setLoading(false);
      router.replace("community/all");
    } else {
      setLoading(false);
      Alert.alert("Code is either expired or wrong", "Please try again");
    }
  };

  const isIOS = Platform.OS === "ios";

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View
        style={{
          backgroundColor: colors.primary,
          width: "100%",
          height: 84,
          justifyContent: "space-around",
          paddingHorizontal: 32,
        }}>
        <Text
          style={{
            alignSelf: "center",
            fontSize: 18,
            color: "white",
            fontWeight: "600",
            marginTop: 32,
          }}>
          Parivaar
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ marginTop: 16, fontSize: 30, fontWeight: "700" }}>
          Enter Code
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            fontWeight: "400",
            color: colors.textLight,
            marginBottom: 32,
          }}>
          {`We’ve sent an SMS with an activation code to your phone number +91${phone}`}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            fontWeight: "400",
            color: colors.textLight,
            marginBottom: 8,
          }}>
          {`Enter 6 digit code recieved on SMS`}
        </Text>
        <TextInput
          autoFocus
          maxLength={6}
          value={text}
          onChangeText={(text) => {
            if (text?.length === 6) {
              Keyboard?.dismiss();
            }
            setText(text);
          }}
          keyboardType="number-pad"
          {...(isIOS && { textContentType: "oneTimeCode" })}
          {...(!isIOS && { autoComplete: "sms-otp" })}
          style={{
            letterSpacing: 10,
            borderColor: "#c3c3c3",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            height: 64,
            fontSize: 22,
            fontWeight: "500",
          }}
        />
        <Button
          disabled={text?.length !== 6}
          style={{ marginTop: 64 }}
          title="Login"
          onPress={onLogin}
          loading={loading}
        />
        <TouchableOpacity
          onPress={async () => {
            setOtpSent(false);
          }}>
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: colors.textLight,
              textAlign: "center",
            }}>
            {`Go Back`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EnterOtp;
