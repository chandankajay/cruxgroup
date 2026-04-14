"use server";

import { createCaller } from "@repo/api";

const caller = createCaller({});

export async function sendOtpAction(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.auth.sendOtp({ phone });
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
    await caller.auth.verifyOtp({ phone, code });
    return { verified: true };
  } catch {
    return { verified: false, error: "INVALID_OTP" };
  }
}
