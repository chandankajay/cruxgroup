import { CredentialsSignin } from "next-auth";
import { prisma } from "@repo/db";
import { NextResponse } from "next/server";
import { signIn } from "../../../../lib/auth";
import { normalizeBookingsPhone } from "../../../../lib/phone";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const phone = typeof b.phone === "string" ? b.phone : null;
  const otp = typeof b.otp === "string" ? b.otp : null;

  if (!phone?.trim() || !otp?.trim()) {
    return NextResponse.json(
      { ok: false, error: "PHONE_AND_OTP_REQUIRED" },
      { status: 400 },
    );
  }

  const phoneNumber = normalizeBookingsPhone(phone);

  const prior = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { welcomeNoteSentAt: true },
  });
  const isNewUser = !prior?.welcomeNoteSentAt;

  let redirectTo: string | URL;
  try {
    redirectTo = await signIn("credentials", {
      phoneNumber,
      otp,
      redirect: false,
    });
  } catch (err) {
    if (
      err instanceof CredentialsSignin ||
      (err instanceof Error && err.name === "CredentialsSignin")
    ) {
      return NextResponse.json(
        { ok: false, error: "INVALID_CREDENTIALS" },
        { status: 401 },
      );
    }
    throw err;
  }

  const redirectStr =
    typeof redirectTo === "string"
      ? redirectTo
      : redirectTo instanceof URL
        ? redirectTo.toString()
        : String(redirectTo);

  const base =
    process.env["NEXTAUTH_URL"] ??
    process.env["AUTH_URL"] ??
    "http://localhost:3000";

  try {
    const parsed = new URL(redirectStr, base);
    const err = parsed.searchParams.get("error");
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 401 });
    }
  } catch {
    if (redirectStr.includes("error=")) {
      return NextResponse.json({ ok: false, error: "AUTH_ERROR" }, { status: 401 });
    }
  }

  return NextResponse.json({ ok: true, isNewUser });
}
