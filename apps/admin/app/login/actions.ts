"use server";

import { CredentialsSignin } from "next-auth";
import { sendAdminOtpWithWhatsApp } from "@repo/api";
import { signIn } from "../../lib/auth";
import { normalizeAdminPhone } from "../../lib/phone";

export async function sendAdminOtpAction(
  phone: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneNumber = normalizeAdminPhone(phone);
    await sendAdminOtpWithWhatsApp(phoneNumber);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("OTP_ACCOUNT_LOCKED")) {
      return { success: false, error: "ACCOUNT_LOCKED" };
    }
    console.error("[admin] sendAdminOtpAction failed:", msg);
    return { success: false, error: "FAILED_TO_SEND" };
  }
}

/**
 * Server-side partner credentials sign-in (same pattern as bookings).
 * Uses master OTP `112233` from `DEV_MASTER_OTP` in `authorize()`.
 *
 * When `authorize` returns null, Auth.js throws `CredentialsSignin` (it does
 * not always return a redirect URL with `error=`). Catch it so the UI gets
 * `{ ok: false }` instead of a 500 from the Server Action.
 */
export async function signInPartnerPhoneAction(
  phoneNumber: string,
  otp: string,
): Promise<{ ok: true } | { ok: false; errorCode?: string }> {
  const normalizedPhone = normalizeAdminPhone(phoneNumber);

  let redirectTo: string | URL;
  try {
    redirectTo = await signIn("phone-otp", {
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
    "http://localhost:3001";

  try {
    const parsed = new URL(redirectStr, base);
    const authErr = parsed.searchParams.get("error");
    if (authErr) {
      return { ok: false, errorCode: authErr };
    }
  } catch {
    if (redirectStr.includes("error=")) {
      return { ok: false, errorCode: "AuthError" };
    }
  }

  return { ok: true };
}
