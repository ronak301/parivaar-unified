import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { themeColors } from "@/theme";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApi } from "@/api/useApi";
import { setAccessToken, setUser } from "@/modules/authentication/redux/authSlice";
import { getMemberDetails } from "@/api/directoryApi";
import { sendEvent } from "@/api/events";
import { verifyOtp } from "@/api/authApi";
import {
  mockOtpLoginUserId,
  testAccessToken,
  usesMockOtpSession,
} from "@/modules/authentication/utils/authUtils";
import type { AxiosResponse } from "axios";

type Props = {
  phone: string;
  setOtpSent: (v: boolean) => void;
};

export function EnterOtp({ phone, setOtpSent }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const { request: getMemberDetailsApi } = useApi(getMemberDetails);

  const onLogin = async () => {
    setLoading(true);

    const useMock = usesMockOtpSession(phone, text);
    let data: { data?: { jwt?: string; userId?: string } } | undefined;
    if (!useMock) {
      const verifyRes = (await verifyOtp(phone, text)) as AxiosResponse<{
        data?: { jwt?: string; userId?: string };
      }>;
      data = verifyRes?.data;
    }

    const accessToken = useMock ? testAccessToken : data?.data?.jwt;
    const userId = useMock ? mockOtpLoginUserId(phone, text) : data?.data?.userId;
    const memberRes = (await getMemberDetailsApi(userId!)) as AxiosResponse<{
      data?: unknown;
    }>;
    const currentFullUser = memberRes?.data;
    const user = (currentFullUser as { data?: Record<string, unknown> })?.data;

    dispatch(setAccessToken(accessToken ?? ""));
    dispatch(setUser(user));

    if (accessToken) {
      sendEvent(
        `New Login - ${phone} ${(user as { firstName?: string })?.firstName} ${(user as { lastName?: string })?.lastName}`
      );
      setLoading(false);
      navigate("/community/all", { replace: true });
    } else {
      setLoading(false);
      window.alert("Code is either expired or wrong. Please try again.");
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          backgroundColor: themeColors.primary,
          width: "100%",
          height: 84,
          display: "flex",
          justifyContent: "space-around",
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        <Text
          style={{
            alignSelf: "center",
            fontSize: 18,
            color: "white",
            fontWeight: 600,
            marginTop: 32,
          }}
        >
          Parivaar
        </Text>
      </div>
      <div style={{ paddingLeft: 16, paddingRight: 16 }}>
        <Text style={{ marginTop: 16, fontSize: 30, fontWeight: 700, display: "block" }}>
          Enter Code
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            fontWeight: 400,
            color: themeColors.textLight,
            marginBottom: 32,
            display: "block",
          }}
        >
          {`We've sent an SMS with an activation code to your phone number +91${phone}`}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            fontWeight: 400,
            color: themeColors.textLight,
            marginBottom: 8,
            display: "block",
          }}
        >
          Enter 6 digit code recieved on SMS
        </Text>
        <input
          autoFocus
          maxLength={6}
          value={text}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setText(v);
            if (v.length === 6) {
              e.target.blur();
            }
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          style={{
            letterSpacing: 10,
            borderColor: "#c3c3c3",
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: 8,
            paddingLeft: 16,
            paddingRight: 16,
            height: 64,
            fontSize: 22,
            fontWeight: 500,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <Button
          disabled={text.length !== 6}
          style={{ marginTop: 64 }}
          title="Login"
          onPress={onLogin}
          loading={loading}
        />
        <button
          type="button"
          onClick={() => setOtpSent(false)}
          style={{
            marginTop: 16,
            fontSize: 14,
            color: themeColors.textLight,
            textAlign: "center",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
