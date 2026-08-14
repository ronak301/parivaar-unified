import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/api/auth";
import { isAllowedAdminPhone } from "@/lib/auth/allowlist";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const number = typeof body?.number === "string" ? body.number : "";
  const otp = typeof body?.otp === "string" ? body.otp : "";

  if (!number || !otp) {
    return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
  }

  if (!isAllowedAdminPhone(number)) {
    return NextResponse.json({ error: "This phone number is not authorized" }, { status: 403 });
  }

  try {
    const response = await verifyOtp(number, otp);
    const jwt = response.data?.data?.jwt;

    if (!jwt) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    await setSessionCookie(jwt);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }
}
