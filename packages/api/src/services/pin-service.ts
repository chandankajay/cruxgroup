import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";

const PIN_LENGTH = 4;
const BCRYPT_ROUNDS = 10;
const MAX_PIN_FAILS_BEFORE_LOCKOUT = 5;
const PIN_LOCKOUT_MINUTES = 15;

/** Common weak 4-digit PINs rejected at set/reset time. */
export const WEAK_PINS = new Set([
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "1234",
  "4321",
  "1212",
  "1010",
]);

export type LoginStep = "otp" | "pin";

export type PinVerifyError = "NOT_SET" | "LOCKED" | "WRONG_PIN";

export type PinValidationError = "INVALID_FORMAT" | "WEAK_PIN";

export function validatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function isWeakPin(pin: string): boolean {
  return WEAK_PINS.has(pin);
}

export function validatePinForSet(pin: string): PinValidationError | null {
  if (!validatePinFormat(pin)) return "INVALID_FORMAT";
  if (isWeakPin(pin)) return "WEAK_PIN";
  return null;
}

export function isPinLocked(user: {
  pinLockoutUntil: Date | null;
}): boolean {
  return !!user.pinLockoutUntil && user.pinLockoutUntil > new Date();
}

export async function hashPin(pin: string): Promise<string> {
  const validationError = validatePinForSet(pin);
  if (validationError === "INVALID_FORMAT") {
    throw new Error("PIN_INVALID_FORMAT");
  }
  if (validationError === "WEAK_PIN") {
    throw new Error("PIN_WEAK");
  }
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function clearPinLockout(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { pinAttempts: 0, pinLockoutUntil: null },
  });
}

async function recordFailedPinAttempt(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinAttempts: true },
  });
  if (!user) return;

  const next = user.pinAttempts + 1;
  if (next >= MAX_PIN_FAILS_BEFORE_LOCKOUT) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pinAttempts: 0,
        pinLockoutUntil: new Date(
          Date.now() + PIN_LOCKOUT_MINUTES * 60 * 1000,
        ),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { pinAttempts: next },
    });
  }
}

export async function verifyPin(
  userId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; error: PinVerifyError }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true, pinLockoutUntil: true },
  });

  if (!user?.pinHash) {
    return { ok: false, error: "NOT_SET" };
  }
  if (isPinLocked(user)) {
    return { ok: false, error: "LOCKED" };
  }

  const normalized = pin.replace(/\D/g, "");
  if (!validatePinFormat(normalized)) {
    await recordFailedPinAttempt(userId);
    return { ok: false, error: "WRONG_PIN" };
  }

  const matches = await bcrypt.compare(normalized, user.pinHash);
  if (!matches) {
    await recordFailedPinAttempt(userId);
    return { ok: false, error: "WRONG_PIN" };
  }

  await clearPinLockout(userId);
  return { ok: true };
}

export async function setPin(userId: string, pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await prisma.user.update({
    where: { id: userId },
    data: {
      pinHash: hash,
      pinSetAt: new Date(),
      pinAttempts: 0,
      pinLockoutUntil: null,
    },
  });
}

/** After OTP verified in the same login / reset flow. */
export async function resetPinAfterOtp(
  userId: string,
  pin: string,
): Promise<void> {
  await setPin(userId, pin);
}

/**
 * After normalizing phone, decide whether the client should show OTP or PIN entry.
 */
export async function resolveLoginStep(phoneNumber: string): Promise<LoginStep> {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { pinHash: true },
  });

  if (user?.pinHash) {
    return "pin";
  }
  return "otp";
}
