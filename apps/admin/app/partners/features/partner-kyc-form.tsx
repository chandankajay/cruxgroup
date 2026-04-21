"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitPartnerKycForm } from "../kyc-actions";
import type { KycSubmissionErrorCode } from "../kyc-shared";

const DUPLICATE_CODES = new Set<KycSubmissionErrorCode>([
  "DUPLICATE_PAN",
  "DUPLICATE_AADHAAR",
  "DUPLICATE_GST",
]);

interface PartnerKycFormProps {
  readonly partnerUserId: string;
  readonly partnerName: string;
}

export function PartnerKycForm({ partnerUserId, partnerName }: PartnerKycFormProps) {
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [gst, setGst] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFieldError(null);
      startTransition(async () => {
        const result = await submitPartnerKycForm({
          partnerUserId,
          panNumber: pan || null,
          aadhaarNumber: aadhaar || null,
          gstNumber: gst || null,
        });

        if (!result.success) {
          if (DUPLICATE_CODES.has(result.code)) {
            setFieldError(result.error);
          } else {
            setFieldError(null);
            toast.error("KYC save failed", { description: result.error });
          }
          return;
        }

        toast.success("KYC submitted", {
          description: `${partnerName}: identifiers saved for verification.`,
        });
      });
    },
    [partnerUserId, partnerName, pan, aadhaar, gst]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-semibold text-charcoal">KYC identifiers</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          PAN, Aadhaar, and GST must be unique across partners. Values are normalized
          before save.
        </p>
      </div>

      <form className="space-y-4 p-6" onSubmit={handleSubmit}>
        {fieldError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
          >
            {fieldError}
          </div>
        ) : null}

        <div>
          <label htmlFor={`kyc-pan-${partnerUserId}`} className="text-xs font-semibold text-charcoal">
            PAN
          </label>
          <input
            id={`kyc-pan-${partnerUserId}`}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            autoComplete="off"
            placeholder="e.g. ABCDE1234F"
            value={pan}
            onChange={(ev) => setPan(ev.target.value)}
            disabled={pending}
          />
        </div>

        <div>
          <label
            htmlFor={`kyc-aadhaar-${partnerUserId}`}
            className="text-xs font-semibold text-charcoal"
          >
            Aadhaar number
          </label>
          <input
            id={`kyc-aadhaar-${partnerUserId}`}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            autoComplete="off"
            inputMode="numeric"
            placeholder="12 digits"
            value={aadhaar}
            onChange={(ev) => setAadhaar(ev.target.value)}
            disabled={pending}
          />
        </div>

        <div>
          <label htmlFor={`kyc-gst-${partnerUserId}`} className="text-xs font-semibold text-charcoal">
            GST number (optional)
          </label>
          <input
            id={`kyc-gst-${partnerUserId}`}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            autoComplete="off"
            placeholder="15-character GSTIN"
            value={gst}
            onChange={(ev) => setGst(ev.target.value)}
            disabled={pending}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save KYC identifiers"}
        </button>
      </form>
    </div>
  );
}
