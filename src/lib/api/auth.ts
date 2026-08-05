import client from "./client";
import type { VerifyOtpResponse } from "./types";

// Response shape not read by legacy code — treat defensively.
export function sendOtp(number: string) {
  return client.post<unknown>("/user/sendOtp", { number });
}

// JWT is nested two levels deep: response.data.data.jwt
export function verifyOtp(number: string, otp: string) {
  return client.post<VerifyOtpResponse>("/user/verifyOtp", { number, otp });
}
