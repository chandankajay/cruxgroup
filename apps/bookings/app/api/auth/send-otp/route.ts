import { sendBookingsOtpWithWhatsApp } from "@repo/api";
import { NextResponse } from "next/server";
import { normalizeBookingsPhone } from "../../../../lib/phone";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const phone =
    typeof body === "object" &&
    body !== null &&
    "phone" in body &&
    typeof (body as { phone: unknown }).phone === "string"
      ? (body as { phone: string }).phone
      : null;

  if (!phone?.trim()) {
    return NextResponse.json({ ok: false, error: "PHONE_REQUIRED" }, { status: 400 });
  }

  try {
    const phoneNumber = normalizeBookingsPhone(phone);
    await sendBookingsOtpWithWhatsApp(phoneNumber);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("Too many failed") ||
      msg.includes("OTP_ACCOUNT_LOCKED") ||
      msg.includes("TOO_MANY_REQUESTS")
    ) {
      return NextResponse.json({ ok: false, error: "ACCOUNT_LOCKED" }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: "FAILED_TO_SEND" }, { status: 500 });
  }
}
