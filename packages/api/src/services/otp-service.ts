import { randomInt } from "node:crypto";
import { prisma } from "@repo/db";

/** Dev / pre–WhatsApp bypass — must match bookings NextAuth credentials check. */
export const DEV_MASTER_OTP = "112233";

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const MAX_OTP_FAILS_BEFORE_LOCKOUT = 5;
const LOCKOUT_MINUTES = 15;

function generateCode(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(min, max));
}

async function clearOtpLockoutForPhone(phone: string): Promise<void> {
  await prisma.user.updateMany({
    where: { phoneNumber: phone },
    data: { otpAttempts: 0, lockoutUntil: null },
  });
}

async function recordFailedOtpAttemptForPhone(phone: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
    select: { id: true, otpAttempts: true },
  });
  if (!user) return;

  const next = user.otpAttempts + 1;
  if (next >= MAX_OTP_FAILS_BEFORE_LOCKOUT) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpAttempts: 0,
        lockoutUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { otpAttempts: next },
    });
  }
}

export async function createOtp(phone: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
    select: { lockoutUntil: true },
  });
  if (user?.lockoutUntil && user.lockoutUntil > new Date()) {
    throw new Error("OTP_ACCOUNT_LOCKED");
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otp.create({
    data: { phone, code, expiresAt },
  });

  return code;
}

export type VerifyOtpResult =
  | { readonly verified: true; readonly lockedOut: false }
  | { readonly verified: false; readonly lockedOut: true }
  | { readonly verified: false; readonly lockedOut: false };

/**
 * Verifies a login OTP for `phone`. Enforces lockout after repeated failures (see User.otpAttempts / lockoutUntil).
 * Dev master OTP bypass still clears lockout state for that phone when successful.
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
    select: { lockoutUntil: true },
  });
  if (user?.lockoutUntil && user.lockoutUntil > new Date()) {
    return { verified: false, lockedOut: true };
  }

  const normalizedCode = code.replace(/\D/g, "");
  if (normalizedCode === DEV_MASTER_OTP) {
    await clearOtpLockoutForPhone(phone);
    return { verified: true, lockedOut: false };
  }

  const otp = await prisma.otp.findFirst({
    where: {
      phone,
      code: normalizedCode,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    await recordFailedOtpAttemptForPhone(phone);
    return { verified: false, lockedOut: false };
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  await clearOtpLockoutForPhone(phone);
  return { verified: true, lockedOut: false };
}
