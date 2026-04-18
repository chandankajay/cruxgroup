"use server";

import { CredentialsSignin } from "next-auth";
import { createCaller } from "@repo/api";
import { prisma } from "@repo/db";
import { signIn } from "../../lib/auth";
import { normalizeBookingsPhone } from "../../lib/phone";

const caller = createCaller({});

export async function sendOtpAction(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneNumber = normalizeBookingsPhone(phone);
    await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: {
        phoneNumber,
        role: "USER",
      },
    });
    await caller.auth.sendOtp({ phone: phoneNumber });
    return { success: true };
  } catch {
    return { success: false, error: "FAILED_TO_SEND" };
  }
}

export async function verifyOtpAction(
  phone: string,
  code: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizeBookingsPhone(phone);
    const result = await caller.auth.verifyOtp({
      phone: normalizedPhone,
      code,
    });
    if (!result.verified) {
      return { verified: false, error: "INVALID_OTP" };
    }
    return { verified: true };
  } catch {
    return { verified: false, error: "INVALID_OTP" };
  }
}

/**
 * Server-side credentials sign-in (skips client CSRF/providers flow).
 * Required for reliable App Router + cookie behavior in development.
 */
export async function signInWithCredentialsAction(
  phoneNumber: string,
  otp: string,
): Promise<{ ok: true } | { ok: false; errorCode?: string }> {
  const normalizedPhone = normalizeBookingsPhone(phoneNumber);

  let redirectTo: string | URL;
  try {
    redirectTo = await signIn("credentials", {
      phoneNumber: normalizedPhone,
      otp,
      redirect: false,
    });
  } catch (err) {
    if (
      err instanceof CredentialsSignin ||
      (err instanceof Error && err.name === "CredentialsSignin")
    ) {
      return { ok: false, errorCode: "CredentialsSignin" };
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
      return { ok: false, errorCode: err };
    }
  } catch {
    if (redirectStr.includes("error=")) {
      return { ok: false, errorCode: "AuthError" };
    }
  }

  return { ok: true };
}
