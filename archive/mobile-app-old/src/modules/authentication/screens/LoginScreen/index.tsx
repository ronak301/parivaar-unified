import { View, Alert, Platform, UIManager } from "react-native";
import React from "react";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import EnterOtp from "./components/EnterOtp";
import { sendEvent } from "src/api/events";
import { sendOtp } from "src/api/authApi";
import {
  isDummyNumber,
  isOtpBypassPhone,
} from "../../utils/authUtils";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function LoginScreen() {
  const [loading, setLoading] = React.useState(false);
  const [phone, setPhone] = React.useState();
  const [otpSent, setOtpSent] = React.useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    if (!values?.phone) return;
    setPhone(values?.phone);

    const { data } = await sendOtp(values?.phone);

    if (
      data?.success ||
      isDummyNumber(values?.phone) ||
      isOtpBypassPhone(values?.phone)
    ) {
      setOtpSent(true);
      setLoading(false);
    } else {
      setOtpSent(false);
      setLoading(false);

      if (data?.error === "Number does not exist, Signups are disabled") {
        sendEvent(
          `Number Entered doesnt belong to any community. - ${values?.phone}`
        );
        Alert.alert(
          "Sorry! Number Entered doesnt belong to any community.",
          "You are currently not member of any community. Please contact app owner."
        );
      } else {
        sendEvent(
          `Something went wrong while sending OTP, so cant send at the moment for phone number - ${values?.phone}`
        );
        Alert.alert(
          "Something went wrong",
          "Cannot send otp at the moment. Please try again later."
        );
      }
    }
  };

  return otpSent ? (
    <EnterOtp phone={phone} setOtpSent={setOtpSent} />
  ) : (
    <View
      style={{
        flex: 1,
      }}>
      <View style={{ flex: 1, paddingBottom: 32 }}>
        <LoginForm onSubmit={onSubmit} loading={loading} />
        <Footer />
      </View>
    </View>
  );
}
