"use server";

import { prisma } from "@repo/db";
import { verifyPin, setPin, createCaller, resetPinAfterOtp } from "@repo/api";
import { auth } from "../../lib/auth";

const caller = createCaller({});

export type ProfileFormState =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfileAction(input: {
  name: string;
  email: string;
  companyName: string;
}): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }

  const name = input.name.trim();
  const emailTrim = input.email.trim();
  const companyTrim = input.companyName.trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: emailTrim === "" ? null : emailTrim,
      companyName: companyTrim,
    },
  });

  return { ok: true };
}

export async function changePinAction(
  currentPin: string,
  newPin: string,
  confirmPin: string,
): Promise<
  | { ok: true }
  | { ok: false; error: "NOT_SIGNED_IN" | "MISMATCH" | "WEAK_PIN" | "WRONG_PIN" | "LOCKED" | "INVALID" }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }
  if (newPin !== confirmPin) {
    return { ok: false, error: "MISMATCH" };
  }

  const verifyResult = await verifyPin(session.user.id, currentPin);
  if (!verifyResult.ok) {
    if (verifyResult.error === "LOCKED") return { ok: false, error: "LOCKED" };
    return { ok: false, error: "WRONG_PIN" };
  }

  try {
    await setPin(session.user.id, newPin);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("PIN_WEAK")) return { ok: false, error: "WEAK_PIN" };
    return { ok: false, error: "INVALID" };
  }
}

export async function changePinWithOtpAction(
  otp: string,
  newPin: string,
  confirmPin: string,
): Promise<
  | { ok: true }
  | { ok: false; error: "NOT_SIGNED_IN" | "MISMATCH" | "WEAK_PIN" | "INVALID_OTP" | "INVALID" }
> {
  const session = await auth();
  if (!session?.user?.id || !session.user.phoneNumber) {
    return { ok: false, error: "NOT_SIGNED_IN" };
  }
  if (newPin !== confirmPin) {
    return { ok: false, error: "MISMATCH" };
  }

  const otpResult = await caller.auth.verifyOtp({
    phone: session.user.phoneNumber,
    code: otp,
  });
  if (!otpResult.verified) {
    return { ok: false, error: "INVALID_OTP" };
  }

  try {
    await resetPinAfterOtp(session.user.id, newPin);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("PIN_WEAK")) return { ok: false, error: "WEAK_PIN" };
    return { ok: false, error: "INVALID" };
  }
}
