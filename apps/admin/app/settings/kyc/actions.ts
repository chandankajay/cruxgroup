"use server";

import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { auth } from "../../../lib/auth";
import { normalizeAadhaar, normalizeGst, normalizePan } from "../../../lib/formatters";
import { findPartnerKycIdentifierConflict } from "../../partners/kyc-actions";
import type { KycSubmissionErrorCode } from "../../partners/kyc-shared";
import {
  GST_REGEX,
  IFSC_REGEX,
  MAX_KYC_FILE_BYTES,
  PAN_REGEX,
  isAllowedKycMime,
} from "./schema";

export type TrustCenterSubmitResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code:
        | KycSubmissionErrorCode
        | "VALIDATION"
        | "UNAUTHORIZED"
        | "NO_PARTNER"
        | "FORBIDDEN"
        | "SERVER_ERROR";
    };

function requirePartnerSession() {
  return auth().then((session) => {
    const userId = session?.user?.id;
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!userId) return { ok: false as const, reason: "UNAUTHORIZED" as const };
    if (role !== "PARTNER") return { ok: false as const, reason: "FORBIDDEN" as const };
    return { ok: true as const, userId };
  });
}

function normalizeIfsc(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

function normalizeBankAccount(raw: string): string {
  return raw.replace(/\s/g, "");
}

function assertKycFile(file: unknown, label: string): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return `Missing ${label} upload.`;
  }
  if (file.size > MAX_KYC_FILE_BYTES) {
    return `${label} must be 5MB or smaller.`;
  }
  if (!isAllowedKycMime(file)) {
    return `${label}: only JPEG, PNG, WebP, or PDF allowed.`;
  }
  return null;
}

type KycFileOrReuseError = { ok: false; error: string };
type KycFileOrReuseResult =
  | { ok: true; kind: "file"; file: File }
  | { ok: true; kind: "url"; url: string };

/**
 * Rejected KYC: partners may resubmit with new files or (when omitted) keep existing Blob URLs.
 * First-time submit (`PENDING`) always requires a new file per document.
 */
function assertKycFileOrReuse(
  file: unknown,
  label: string,
  ctx: { canReuse: boolean; existingUrl: string | null }
): KycFileOrReuseError | KycFileOrReuseResult {
  if (file instanceof File && file.size > 0) {
    const err = assertKycFile(file, label);
    if (err) return { ok: false, error: err };
    return { ok: true, kind: "file", file };
  }
  if (ctx.canReuse && ctx.existingUrl) {
    return { ok: true, kind: "url", url: ctx.existingUrl };
  }
  if (file instanceof File && file.size === 0) {
    if (ctx.canReuse && ctx.existingUrl) {
      return { ok: true, kind: "url", url: ctx.existingUrl };
    }
    return { ok: false, error: `Missing ${label} upload.` };
  }
  return { ok: false, error: `Missing ${label} upload.` };
}

async function putKycFile(
  userId: string,
  kind: string,
  file: File
): Promise<
  | { ok: true; url: string }
  | { ok: false; reason: "NO_BLOB_TOKEN" | "BLOB_REJECTED"; detail?: string }
> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.error("[KYC] BLOB_READ_WRITE_TOKEN is missing — Blob uploads cannot run.");
    return { ok: false, reason: "NO_BLOB_TOKEN" };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const pathname = `kyc/${userId}/${kind}-${Date.now()}-${safeName}`;
  try {
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
      token,
    });
    return { ok: true, url: blob.url };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[KYC] Vercel Blob put() failed", {
      kind,
      pathname,
      fileName: file.name,
      fileSize: file.size,
      message,
    });
    return { ok: false, reason: "BLOB_REJECTED", detail: message };
  }
}

function kycBlobFailureMessage(
  result: { ok: false; reason: "NO_BLOB_TOKEN" | "BLOB_REJECTED"; detail?: string },
  label: string
): string {
  if (result.reason === "NO_BLOB_TOKEN") {
    return "File storage is not configured (missing BLOB_READ_WRITE_TOKEN). Add a Vercel Blob read/write token to the server environment.";
  }
  const hint =
    process.env.NODE_ENV === "development" && result.detail
      ? ` (${result.detail})`
      : "";
  return `Upload failed for ${label}.${hint} Check the terminal for "[KYC] Vercel Blob" logs — common causes: invalid or expired BLOB_READ_WRITE_TOKEN, wrong Vercel team/project token, or network issues. File size is unlikely: each file allows up to 5MB.`;
}

/**
 * Full KYC submission: validates FormData, uploads PAN / Aadhaar / cheque to Blob,
 * then persists Partner fields and sets `kycStatus` to SUBMITTED.
 */
export async function uploadKycAction(formData: FormData): Promise<TrustCenterSubmitResult> {
  try {
    const gate = await requirePartnerSession();
    if (!gate.ok) {
      return {
        success: false,
        code: gate.reason === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHORIZED",
        error:
          gate.reason === "FORBIDDEN"
            ? "Only partner accounts can submit KYC."
            : "You must be signed in.",
      };
    }

    const partner = await prisma.partner.findUnique({
      where: { userId: gate.userId },
    });
    if (!partner) {
      return {
        success: false,
        code: "NO_PARTNER",
        error: "Partner profile not found. Contact support to finish onboarding.",
      };
    }

    if (partner.kycStatus !== "PENDING" && partner.kycStatus !== "REJECTED") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "KYC can only be submitted when your status is not yet received or you are correcting a rejection.",
      };
    }

    const panNumber = String(formData.get("panNumber") ?? "");
    const aadhaarNumber = String(formData.get("aadhaarNumber") ?? "");
    const gstNumberRaw = String(formData.get("gstNumber") ?? "");
    const bankAccountNumber = String(formData.get("bankAccountNumber") ?? "");
    const bankIfscCode = String(formData.get("bankIfscCode") ?? "");

    const pan = normalizePan(panNumber);
    const aadhaar = normalizeAadhaar(aadhaarNumber);
    const gst = normalizeGst(gstNumberRaw);
    const ifsc = normalizeIfsc(bankIfscCode);
    const bankAccount = normalizeBankAccount(bankAccountNumber);

    const canReuseOnResubmit = partner.kycStatus === "REJECTED";
    const panFile = formData.get("panDoc");
    const aadhaarFile = formData.get("aadhaarDoc");
    const chequeFile = formData.get("chequeDoc");

    const panRes = assertKycFileOrReuse(panFile, "PAN document", {
      canReuse: canReuseOnResubmit,
      existingUrl: partner.panDocUrl,
    });
    if (!panRes.ok) return { success: false, code: "VALIDATION", error: panRes.error };
    const aadhaarRes = assertKycFileOrReuse(aadhaarFile, "Aadhaar document", {
      canReuse: canReuseOnResubmit,
      existingUrl: partner.aadhaarDocUrl,
    });
    if (!aadhaarRes.ok) {
      return { success: false, code: "VALIDATION", error: aadhaarRes.error };
    }
    const chequeRes = assertKycFileOrReuse(chequeFile, "Cancelled cheque", {
      canReuse: canReuseOnResubmit,
      existingUrl: partner.cancelledChequeUrl,
    });
    if (!chequeRes.ok) return { success: false, code: "VALIDATION", error: chequeRes.error };

    if (!pan || !PAN_REGEX.test(pan)) {
      return {
        success: false,
        code: "VALIDATION",
        error: "Invalid PAN format (e.g., ABCDE1234F)",
      };
    }
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return {
        success: false,
        code: "VALIDATION",
        error: "Aadhaar must be exactly 12 digits",
      };
    }
    if (gst && !GST_REGEX.test(gst)) {
      return {
        success: false,
        code: "VALIDATION",
        error: "Invalid GST format",
      };
    }
    if (!bankAccount || bankAccount.length < 9 || bankAccount.length > 18) {
      return {
        success: false,
        code: "VALIDATION",
        error: "Bank account must be between 9 and 18 digits",
      };
    }
    if (!IFSC_REGEX.test(ifsc)) {
      return {
        success: false,
        code: "VALIDATION",
        error: "Invalid IFSC format",
      };
    }

    const conflict = await findPartnerKycIdentifierConflict(partner.id, {
      pan,
      aadhaar,
      gst,
    });
    if (conflict?.success === false) {
      return {
        success: false,
        code: conflict.code,
        error: conflict.error,
      };
    }

    const uid = gate.userId;

    let panUrl: string;
    if (panRes.kind === "file") {
      const panUp = await putKycFile(uid, "pan", panRes.file);
      if (!panUp.ok) {
        return { success: false, code: "SERVER_ERROR", error: kycBlobFailureMessage(panUp, "PAN document") };
      }
      panUrl = panUp.url;
    } else {
      panUrl = panRes.url;
    }

    let aadhaarUrl: string;
    if (aadhaarRes.kind === "file") {
      const aadhaarUp = await putKycFile(uid, "aadhaar", aadhaarRes.file);
      if (!aadhaarUp.ok) {
        return {
          success: false,
          code: "SERVER_ERROR",
          error: kycBlobFailureMessage(aadhaarUp, "Aadhaar document"),
        };
      }
      aadhaarUrl = aadhaarUp.url;
    } else {
      aadhaarUrl = aadhaarRes.url;
    }

    let chequeUrl: string;
    if (chequeRes.kind === "file") {
      const chequeUp = await putKycFile(uid, "cheque", chequeRes.file);
      if (!chequeUp.ok) {
        return {
          success: false,
          code: "SERVER_ERROR",
          error: kycBlobFailureMessage(chequeUp, "cancelled cheque"),
        };
      }
      chequeUrl = chequeUp.url;
    } else {
      chequeUrl = chequeRes.url;
    }

    try {
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          panNumber: pan,
          panDocUrl: panUrl,
          aadhaarNumber: aadhaar,
          aadhaarDocUrl: aadhaarUrl,
          gstNumber: gst,
          bankAccountNumber: bankAccount,
          bankIfscCode: ifsc,
          cancelledChequeUrl: chequeUrl,
          kycStatus: "SUBMITTED",
          kycRejectionReason: null,
        },
      });
    } catch (e) {
      console.error("[KYC] Prisma partner.update failed", {
        partnerId: partner.id,
        error: e,
      });
      return {
        success: false,
        code: "SERVER_ERROR",
        error: "Could not save your KYC. Please try again.",
      };
    }

    revalidatePath("/settings/kyc");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("[KYC] uploadKycAction unexpected error", e);
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Something went wrong. Please try again.",
    };
  }
}
