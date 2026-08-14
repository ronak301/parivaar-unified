import { useState } from "react";
import { sendOtp } from "@/api/authApi";
import { sendEvent } from "@/api/events";
import {
  isDummyNumber,
  isOtpBypassPhone,
} from "@/modules/authentication/utils/authUtils";
import { LoginForm } from "./LoginForm";
import { Footer } from "./Footer";
import { EnterOtp } from "./EnterOtp";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const onSubmit = async (values: { phone: string }) => {
    setLoading(true);
    if (!values?.phone) return;
    setPhone(values.phone);

    const res = await sendOtp(values.phone);
    const data = res.data as { success?: boolean; error?: string };

    if (
      data?.success ||
      isDummyNumber(values.phone) ||
      isOtpBypassPhone(values.phone)
    ) {
      setOtpSent(true);
      setLoading(false);
    } else {
      setOtpSent(false);
      setLoading(false);

      if (data?.error === "Number does not exist, Signups are disabled") {
        sendEvent(
          `Number Entered doesnt belong to any community. - ${values.phone}`
        );
        window.alert(
          "Sorry! Number Entered doesnt belong to any community.\nYou are currently not member of any community. Please contact app owner."
        );
      } else {
        sendEvent(
          `Something went wrong while sending OTP, so cant send at the moment for phone number - ${values.phone}`
        );
        window.alert(
          "Something went wrong\nCannot send otp at the moment. Please try again later."
        );
      }
    }
  };

  return otpSent ? (
    <EnterOtp phone={phone} setOtpSent={setOtpSent} />
  ) : (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, paddingBottom: 32 }}>
        <LoginForm onSubmit={onSubmit} loading={loading} />
        <Footer />
      </div>
    </div>
  );
}
