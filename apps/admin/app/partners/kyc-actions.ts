"use server";

import { prisma } from "@repo/db";
import { normalizeAadhaar, normalizeGst, normalizePan } from "../../lib/formatters";

export const KYC_DUPLICATE_ERROR_MESSAGES = {
  DUPLICATE_PAN:
    "This PAN number is already registered to another account.",
  DUPLICATE_AADHAAR:
    "This Aadhaar number is already registered to another account.",
  DUPLICATE_GST:
    "This GST number is already registered to another account.",
} as const;

export type KycSubmissionErrorCode =
  | keyof typeof KYC_DUPLICATE_ERROR_MESSAGES
  | "NOT_FOUND"
  | "SERVER_ERROR";

export type SubmitPartnerKycResult =
  | { success: true }
  | { success: false; code: KycSubmissionErrorCode; error: string };

/**
 * Returns a failed {@link SubmitPartnerKycResult} if another partner already
 * uses one of the identifiers; otherwise `null`.
 */
export async function findPartnerKycIdentifierConflict(
  partnerId: string,
  identifiers: { pan: string | null; aadhaar: string | null; gst: string | null }
): Promise<SubmitPartnerKycResult | null> {
  const { pan, aadhaar, gst } = identifiers;

  if (pan) {
    const other = await prisma.partner.findFirst({
      where: { id: { not: partnerId }, panNumber: pan },
      select: { id: true },
    });
    if (other) {
      return {
        success: false,
        code: "DUPLICATE_PAN",
        error: KYC_DUPLICATE_ERROR_MESSAGES.DUPLICATE_PAN,
      };
    }
  }

  if (aadhaar) {
    const other = await prisma.partner.findFirst({
      where: { id: { not: partnerId }, aadhaarNumber: aadhaar },
      select: { id: true },
    });
    if (other) {
      return {
        success: false,
        code: "DUPLICATE_AADHAAR",
        error: KYC_DUPLICATE_ERROR_MESSAGES.DUPLICATE_AADHAAR,
      };
    }
  }

  if (gst) {
    const other = await prisma.partner.findFirst({
      where: { id: { not: partnerId }, gstNumber: gst },
      select: { id: true },
    });
    if (other) {
      return {
        success: false,
        code: "DUPLICATE_GST",
        error: KYC_DUPLICATE_ERROR_MESSAGES.DUPLICATE_GST,
      };
    }
  }

  return null;
}

/**
 * Partner KYC identifiers: duplicate PAN / Aadhaar / GST are blocked at app level
 * (MongoDB cannot safely enforce @unique on optional scalar fields).
 */
export async function submitPartnerKycForm(input: {
  partnerUserId: string;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  gstNumber?: string | null;
}): Promise<SubmitPartnerKycResult> {
  try {
    const partner = await prisma.partner.findUnique({
      where: { userId: input.partnerUserId },
    });
    if (!partner) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: "Partner account not found for this user.",
      };
    }

    const pan = normalizePan(input.panNumber);
    const aadhaar = normalizeAadhaar(input.aadhaarNumber);
    const gst = normalizeGst(input.gstNumber);

    const conflict = await findPartnerKycIdentifierConflict(partner.id, {
      pan,
      aadhaar,
      gst,
    });
    if (conflict) return conflict;

    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        panNumber: pan,
        aadhaarNumber: aadhaar,
        gstNumber: gst,
        kycStatus: "SUBMITTED",
        kycRejectionReason: null,
      },
    });

    return { success: true };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Could not save KYC details. Please try again.",
    };
  }
}
