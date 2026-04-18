"use server";

import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { auth } from "../../../lib/auth";
import { normalizeAadhaar, normalizeGst, normalizePan } from "../../../lib/formatters";
import { findPartnerKycIdentifierConflict, type KycSubmissionErrorCode } from "../../partners/kyc-actions";
import { GST_REGEX, IFSC_REGEX, KYC_ACCEPT_MIME, MAX_KYC_FILE_BYTES, PAN_REGEX } from "./schema";

export type TrustCenterSubmitResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code: KycSubmissionErrorCode | "VALIDATION" | "UNAUTHORIZED" | "NO_PARTNER" | "FORBIDDEN";
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
  if (!(KYC_ACCEPT_MIME as readonly string[]).includes(file.type)) {
    return `${label}: only JPEG, PNG, WebP, or PDF allowed.`;
  }
  return null;
}

async function putKycFile(userId: string, kind: string, file: File): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const pathname = `kyc/${userId}/${kind}-${Date.now()}-${safeName}`;
  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { ok: true, url: blob.url };
  } catch (e) {
    console.error("[putKycFile]", e);
    return {
      ok: false,
      error: "Document upload failed. Check BLOB_READ_WRITE_TOKEN and try again.",
    };
  }
}

/**
 * Full KYC submission: validates FormData, uploads PAN / Aadhaar / cheque to Blob,
 * then persists Partner fields and sets `kycStatus` to SUBMITTED.
 */
export async function uploadKycAction(formData: FormData): Promise<TrustCenterSubmitResult> {
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

  const panFile = formData.get("panDoc");
  const aadhaarFile = formData.get("aadhaarDoc");
  const chequeFile = formData.get("chequeDoc");

  const panErr = assertKycFile(panFile, "PAN document");
  if (panErr) return { success: false, code: "VALIDATION", error: panErr };
  const aadhaarErr = assertKycFile(aadhaarFile, "Aadhaar document");
  if (aadhaarErr) return { success: false, code: "VALIDATION", error: aadhaarErr };
  const chequeErr = assertKycFile(chequeFile, "Cancelled cheque");
  if (chequeErr) return { success: false, code: "VALIDATION", error: chequeErr };

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
  const panUp = await putKycFile(uid, "pan", panFile as File);
  if (!panUp.ok) return { success: false, code: "SERVER_ERROR", error: panUp.error };
  const aadhaarUp = await putKycFile(uid, "aadhaar", aadhaarFile as File);
  if (!aadhaarUp.ok) return { success: false, code: "SERVER_ERROR", error: aadhaarUp.error };
  const chequeUp = await putKycFile(uid, "cheque", chequeFile as File);
  if (!chequeUp.ok) return { success: false, code: "SERVER_ERROR", error: chequeUp.error };

  try {
    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        panNumber: pan,
        panDocUrl: panUp.url,
        aadhaarNumber: aadhaar,
        aadhaarDocUrl: aadhaarUp.url,
        gstNumber: gst,
        bankAccountNumber: bankAccount,
        bankIfscCode: ifsc,
        cancelledChequeUrl: chequeUp.url,
        kycStatus: "SUBMITTED",
        kycRejectionReason: null,
      },
    });
    revalidatePath("/settings/kyc");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Could not save your KYC. Please try again.",
    };
  }
}
