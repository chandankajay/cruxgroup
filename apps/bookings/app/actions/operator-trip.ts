"use server";

import { randomUUID, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";

function billedHoursFromRange(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
}

/** Start job: unchanged narrow contract for the operator UI */
export type OperatorTripActionResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "BAD_STATE" | "BAD_OTP" | "SERVER_ERROR" };

/** End job: strict success/error payload for operator UX and integrations */
export type OperatorEndJobResult =
  | {
      ok: true;
      payload: {
        totalBilledHours: number;
        completedAtIso: string;
        userMessage: string;
      };
    }
  | {
      ok: false;
      error: "NOT_FOUND" | "BAD_STATE" | "BAD_OTP" | "INVALID_INPUT" | "UNIQUE_VIOLATION" | "SERVER_ERROR";
      userMessage: string;
    };

function normalizeOperatorToken(raw: string): string {
  return decodeURIComponent(raw).trim();
}

function normalizeFourDigitOtp(raw: string): { ok: true; digits: string } | { ok: false } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 4) return { ok: false };
  return { ok: true, digits };
}

/** Constant-time comparison when both sides normalize to exactly 4 ASCII digits */
function fourDigitOtpMatches(storedOtp: string, providedDigits: string): boolean {
  if (providedDigits.length !== 4) return false;
  const expected = storedOtp.replace(/\D/g, "");
  if (expected.length !== 4) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(providedDigits, "utf8"));
  } catch {
    return false;
  }
}

export async function operatorStartJobAction(
  token: string,
  otp: string
): Promise<OperatorTripActionResult> {
  const operatorToken = normalizeOperatorToken(token);
  const parsed = normalizeFourDigitOtp(otp);
  if (!parsed.ok) return { ok: false, error: "BAD_OTP" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { operatorToken },
      });
      if (!trip) return { type: "NOT_FOUND" as const };
      if (trip.status !== "CONFIRMED" && trip.status !== "EN_ROUTE") {
        return { type: "BAD_STATE" as const };
      }
      if (!fourDigitOtpMatches(trip.startOtp, parsed.digits)) return { type: "BAD_OTP" as const };

      await tx.trip.update({
        where: { operatorToken },
        data: {
          status: "IN_PROGRESS",
          actualStartTime: new Date(),
        },
      });
      return { type: "ok" as const };
    });

    if (result.type === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
    if (result.type === "BAD_STATE") return { ok: false, error: "BAD_STATE" };
    if (result.type === "BAD_OTP") return { ok: false, error: "BAD_OTP" };

    revalidatePath(`/operator/${operatorToken}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "SERVER_ERROR" };
  }
}

export async function operatorEndJobAction(
  token: string,
  otp: string
): Promise<OperatorEndJobResult> {
  const operatorToken = normalizeOperatorToken(token);
  if (!operatorToken) {
    return {
      ok: false,
      error: "INVALID_INPUT",
      userMessage: "This link is missing required information.",
    };
  }

  const parsed = normalizeFourDigitOtp(otp);
  if (!parsed.ok) {
    return {
      ok: false,
      error: "INVALID_INPUT",
      userMessage: "Enter the full 4-digit end code.",
    };
  }
  const digits = parsed.digits;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { operatorToken },
      });
      if (!trip) return { type: "NOT_FOUND" as const };
      if (trip.status !== "IN_PROGRESS" || !trip.actualStartTime) {
        return { type: "BAD_STATE" as const };
      }
      if (!fourDigitOtpMatches(trip.endOtp, digits)) {
        return { type: "BAD_OTP" as const };
      }

      const end = new Date();
      const totalBilledHours = billedHoursFromRange(trip.actualStartTime, end);
      const reviewToken = randomUUID();

      await tx.trip.update({
        where: { operatorToken },
        data: {
          status: "COMPLETED",
          actualEndTime: end,
          totalBilledHours,
          reviewToken,
        },
      });

      return {
        type: "ok" as const,
        totalBilledHours,
        completedAtIso: end.toISOString(),
        reviewToken,
      };
    });

    if (result.type === "NOT_FOUND") {
      return {
        ok: false,
        error: "NOT_FOUND",
        userMessage: "We could not find this job. The link may be wrong or expired.",
      };
    }
    if (result.type === "BAD_STATE") {
      return {
        ok: false,
        error: "BAD_STATE",
        userMessage: "This job cannot be ended right now. It may already be finished or not started.",
      };
    }
    if (result.type === "BAD_OTP") {
      return {
        ok: false,
        error: "BAD_OTP",
        userMessage: "That code does not match. Check the end code and try again.",
      };
    }

    const { totalBilledHours, completedAtIso, reviewToken } = result;
    const reviewLinkForWhatsApp = `https://bookings.cruxgroup.in/review/${reviewToken}`;
    // TODO: Trigger AiSensy WhatsApp with review link: https://bookings.cruxgroup.in/review/${reviewToken}
    void reviewLinkForWhatsApp;

    revalidatePath(`/operator/${operatorToken}`);

    return {
      ok: true,
      payload: {
        totalBilledHours,
        completedAtIso,
        userMessage: `Job completed (${totalBilledHours} hrs billed). The customer will receive a review link by WhatsApp shortly.`,
      },
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        error: "UNIQUE_VIOLATION",
        userMessage: "Could not save the job (duplicate reference). Please try again.",
      };
    }
    console.error("[operatorEndJobAction] unexpected error", e);
    return {
      ok: false,
      error: "SERVER_ERROR",
      userMessage: "Something went wrong while saving. Please try again or contact dispatch.",
    };
  }
}
