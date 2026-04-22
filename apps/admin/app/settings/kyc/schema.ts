import { z } from "zod";

/** Indian PAN: 5 letters + 4 digits + 1 letter */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Indian GSTIN (15 chars) */
export const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const KYC_ACCEPT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_KYC_FILE_BYTES = 5 * 1024 * 1024;

/** Some browsers report PDFs/uploads as empty type or application/octet-stream. */
export function isAllowedKycMime(file: File): boolean {
  if ((KYC_ACCEPT_MIME as readonly string[]).includes(file.type)) return true;
  if (file.type === "" || file.type === "application/octet-stream") {
    const n = file.name.toLowerCase();
    return /\.(jpe?g|png|webp|pdf)$/.test(n);
  }
  return false;
}

const kycDocumentFileSchema = z
  .instanceof(File, { message: "Please choose a file." })
  .refine((f) => f.size > 0, { message: "Please choose a file." })
  .refine((f) => f.size <= MAX_KYC_FILE_BYTES, {
    message: "File must be 5MB or smaller.",
  })
  .refine((f) => isAllowedKycMime(f), {
    message: "Only JPEG, PNG, WebP, or PDF files are allowed.",
  });

function fileFieldForContext(existingUrl: string | null, allowOmitForReuse: boolean) {
  if (!allowOmitForReuse || !existingUrl) {
    return kycDocumentFileSchema;
  }
  return z
    .union([kycDocumentFileSchema, z.undefined()])
    .superRefine((f, ctx) => {
      if (f === undefined) return;
      if (f instanceof File) {
        const r = kycDocumentFileSchema.safeParse(f);
        if (!r.success) {
          r.error.issues.forEach((issue) => ctx.addIssue(issue));
        }
        return;
      }
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please choose a file." });
    });
}

const optionalFileValueForDisplay = z.custom<File | undefined>().optional();

const sharedKycTextFields = {
  panNumber: z
    .string()
    .trim()
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .refine((s) => PAN_REGEX.test(s), {
      message: "Invalid PAN format (e.g., ABCDE1234F)",
    }),
  aadhaarNumber: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ""))
    .refine((s) => /^\d{12}$/.test(s), {
      message: "Aadhaar must be exactly 12 digits",
    }),
  gstNumber: z
    .string()
    .trim()
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .refine((s) => s.length === 0 || GST_REGEX.test(s), {
      message: "Invalid GST format",
    }),
  bankAccountNumber: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ""))
    .refine((s) => s.length >= 9 && s.length <= 18, {
      message: "Bank account must be between 9 and 18 digits",
    }),
  bankIfscCode: z
    .string()
    .trim()
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .refine((s) => IFSC_REGEX.test(s), {
      message: "Invalid IFSC format",
    }),
};

export function buildKycTrustFormSchema(opts: {
  /** Submitted/verified: no file required (read-only form). */
  readonly isReadOnly: boolean;
  readonly isRejectedResubmit: boolean;
  readonly existingPanDocUrl: string | null;
  readonly existingAadhaarDocUrl: string | null;
  readonly existingChequeUrl: string | null;
}) {
  if (opts.isReadOnly) {
    return z.object({
      ...sharedKycTextFields,
      panDoc: optionalFileValueForDisplay,
      aadhaarDoc: optionalFileValueForDisplay,
      chequeDoc: optionalFileValueForDisplay,
    });
  }
  const { isRejectedResubmit } = opts;
  return z.object({
    ...sharedKycTextFields,
    panDoc: fileFieldForContext(
      opts.existingPanDocUrl,
      isRejectedResubmit && Boolean(opts.existingPanDocUrl)
    ),
    aadhaarDoc: fileFieldForContext(
      opts.existingAadhaarDocUrl,
      isRejectedResubmit && Boolean(opts.existingAadhaarDocUrl)
    ),
    chequeDoc: fileFieldForContext(
      opts.existingChequeUrl,
      isRejectedResubmit && Boolean(opts.existingChequeUrl)
    ),
  });
}

export type KycTrustFormValues = z.infer<ReturnType<typeof buildKycTrustFormSchema>>;
