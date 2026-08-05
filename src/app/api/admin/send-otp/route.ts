import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/lib/api/auth";
import { isAllowedAdminPhone } from "@/lib/auth/allowlist";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const number = typeof body?.number === "string" ? body.number : "";

  if (!number) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  if (!isAllowedAdminPhone(number)) {
    return NextResponse.json({ error: "This phone number is not authorized" }, { status: 403 });
  }

  try {
    await sendOtp(number);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 502 });
  }
}
