"use server";

import { CredentialsSignin } from "next-auth";
import {
  isPinLocked,
  resetPinAfterOtp,
  resolveLoginStep,
  sendAdminOtpWithWhatsApp,
  setPin,
} from "@repo/api";
import { prisma } from "@repo/db";
import { auth, signIn } from "../../lib/auth";
import { normalizeAdminPhone } from "../../lib/phone";

export async function checkLoginStepAction(
  phone: string,
): Promise<{ step: "otp" | "pin" }> {
  const phoneNumber = normalizeAdminPhone(phone);
  const step = await resolveLoginStep(phoneNumber);
  return { step };
}

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

export async function signInPartnerPhoneAction(
  phoneNumber: string,
  otp: string,
): Promise<
  | { ok: true; needsPinSetup: boolean }
  | { ok: false; errorCode?: string }
> {
  const normalizedPhone = normalizeAdminPhone(phoneNumber);

  const existing = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    select: { pinHash: true },
  });

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

  return { ok: true, needsPinSetup: !existing?.pinHash };
}

export async function signInWithPinAction(
  phoneNumber: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; errorCode: "LOCKED" | "WRONG_PIN" | "AuthError" }> {
  const normalizedPhone = normalizeAdminPhone(phoneNumber);

  const user = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    select: { id: true, pinHash: true, pinLockoutUntil: true },
  });

  if (!user?.pinHash) {
    return { ok: false, errorCode: "WRONG_PIN" };
  }
  if (isPinLocked(user)) {
    return { ok: false, errorCode: "LOCKED" };
  }

  let redirectTo: string | URL;
  try {
    redirectTo = await signIn("pin", {
      phoneNumber: normalizedPhone,
      pin,
      redirect: false,
    });
  } catch (err) {
    if (
      err instanceof CredentialsSignin ||
      (err instanceof Error && err.name === "CredentialsSignin")
    ) {
      const refreshed = await prisma.user.findUnique({
        where: { id: user.id },
        select: { pinLockoutUntil: true },
      });
      if (refreshed && isPinLocked(refreshed)) {
        return { ok: false, errorCode: "LOCKED" };
      }
      return { ok: false, errorCode: "WRONG_PIN" };
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
      return { ok: false, errorCode: "AuthError" };
    }
  } catch {
    if (redirectStr.includes("error=")) {
      return { ok: false, errorCode: "AuthError" };
    }
  }

  return { ok: true };
}

export async function setPinAction(
  pin: string,
  confirmPin: string,
): Promise<{ ok: true } | { ok: false; error: "NOT_SIGNED_IN" | "MISMATCH" | "WEAK_PIN" | "INVALID" }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }
  if (pin !== confirmPin) {
    return { ok: false, error: "MISMATCH" };
  }
  try {
    await setPin(session.user.id, pin);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("PIN_WEAK")) return { ok: false, error: "WEAK_PIN" };
    return { ok: false, error: "INVALID" };
  }
}

export async function resetPinAfterOtpAction(
  pin: string,
  confirmPin: string,
): Promise<{ ok: true } | { ok: false; error: "NOT_SIGNED_IN" | "MISMATCH" | "WEAK_PIN" | "INVALID" }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }
  if (pin !== confirmPin) {
    return { ok: false, error: "MISMATCH" };
  }
  try {
    await resetPinAfterOtp(session.user.id, pin);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("PIN_WEAK")) return { ok: false, error: "WEAK_PIN" };
    return { ok: false, error: "INVALID" };
  }
}
