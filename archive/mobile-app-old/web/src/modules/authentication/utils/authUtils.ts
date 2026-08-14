export const isDummyNumber = (phone: string) => phone === "9999999999";

export const testUserId = "104da947-a2a5-4ae8-94b9-b718b6ff5db2";

export const testAccessToken = "123";

/** Help-desk / QA: allow this number to use OTP `000000` (see `isDevOtpBypass`). */
export const DEV_OTP_BYPASS_PHONE = "7042770304";
export const DEV_OTP_BYPASS_CODE = "000000";

/**
 * Optional: paste the real member UUID for `DEV_OTP_BYPASS_PHONE` so `000000` loads that profile.
 * How to get it once: log in with a normal SMS OTP → browser DevTools → Network → `verifyOtp` → response JSON → `data.userId`.
 * Leave empty to keep using `testUserId` (same as dummy 9999999999 login).
 */
export const DEV_OTP_BYPASS_USER_ID_OVERRIDE =
  "3d102aa6-163e-42e4-af2f-1168c4753b93";

function otpBypassAllowed(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_ALLOW_OTP_BYPASS === "true"
  );
}

/** Proceed to OTP step without `sendOtp` succeeding (paired with `isDevOtpBypass`). */
export function isOtpBypassPhone(phone: string): boolean {
  if (!otpBypassAllowed()) return false;
  return phone === DEV_OTP_BYPASS_PHONE;
}

export function isDevOtpBypass(phone: string, otp: string): boolean {
  if (!otpBypassAllowed()) return false;
  return phone === DEV_OTP_BYPASS_PHONE && otp === DEV_OTP_BYPASS_CODE;
}

export function getDevOtpBypassUserId(): string {
  if (DEV_OTP_BYPASS_USER_ID_OVERRIDE.trim().length > 0) {
    return DEV_OTP_BYPASS_USER_ID_OVERRIDE.trim();
  }
  const id = import.meta.env.VITE_DEV_OTP_BYPASS_USER_ID;
  if (typeof id === "string" && id.trim().length > 0) return id.trim();
  return testUserId;
}

export function usesMockOtpSession(phone: string, otp: string): boolean {
  return isDummyNumber(phone) || isDevOtpBypass(phone, otp);
}

export function mockOtpLoginUserId(phone: string, otp: string): string {
  if (isDevOtpBypass(phone, otp)) return getDevOtpBypassUserId();
  return testUserId;
}
