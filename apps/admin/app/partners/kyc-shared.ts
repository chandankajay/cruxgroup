/**
 * Shared KYC types & messages. Kept out of `"use server"` modules — Next.js only
 * allows async function exports from Server Action files.
 */
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
