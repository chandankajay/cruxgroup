"use client";

import { useCallback, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import type { LiveTripInvoiceDto } from "../../../../lib/job-board-types";
import {
  generateTripInvoiceManualAction,
  resendTripInvoicePaymentLinkAction,
  sendTripInvoiceWhatsAppAction,
} from "../trip-invoice-actions";

type SendState = "idle" | "sending" | "success" | "error";

const fadeSlide = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export interface InvoiceScreenProps {
  readonly tripId: string;
  readonly invoice: LiveTripInvoiceDto | null;
  readonly customerPhone: string;
  readonly isSuperAdmin: boolean;
  readonly onRefresh?: () => void;
}

export function InvoiceScreen({
  tripId,
  invoice,
  customerPhone,
  isSuperAdmin,
  onRefresh,
}: InvoiceScreenProps) {
  const [pending, startTransition] = useTransition();
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState<string>();
  const [overridePhone, setOverridePhone] = useState("");

  const run = useCallback(
    (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, okMsg: string) => {
      startTransition(async () => {
        const res = await fn();
        if (res.ok) {
          toast.success(okMsg);
          onRefresh?.();
        } else {
          toast.error(res.error);
        }
      });
    },
    [onRefresh]
  );

  const handleSendWhatsApp = useCallback(() => {
    setSendError(undefined);
    setSendState("sending");
    startTransition(async () => {
      const trimmedOverride = overridePhone.replace(/\D/g, "");
      const res = await sendTripInvoiceWhatsAppAction(
        tripId,
        trimmedOverride.length >= 10 ? overridePhone : undefined
      );
      if (res.ok) {
        setSendState("success");
        toast.success("Invoice sent via WhatsApp.");
        onRefresh?.();
        window.setTimeout(() => setSendState("idle"), 2400);
      } else {
        setSendState("error");
        setSendError(res.error);
        toast.error(res.error);
        window.setTimeout(() => setSendState("idle"), 3200);
      }
    });
  }, [tripId, overridePhone, onRefresh]);

  const canSendWhatsApp = isSuperAdmin && invoice != null;

  return (
    <motion.div
      layout
      className="sm:col-span-2 space-y-3 rounded-lg border border-emerald-800/20 bg-card/80 p-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">Invoice</p>

      {invoice ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-foreground/70">{invoice.invoiceNumber}</p>

          <div className="flex flex-wrap gap-2">
            {invoice.pdfUrl ? (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                View invoice PDF
              </a>
            ) : null}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  () => resendTripInvoicePaymentLinkAction(tripId),
                  "Invoice sent to the customer on WhatsApp."
                )
              }
            >
              {pending ? "Sending…" : "Resend invoice"}
            </Button>
          </div>

          {isSuperAdmin ? (
            <div className="space-y-2 rounded-md border border-green-600/25 bg-green-50/60 p-3">
              <p className="text-xs font-semibold text-green-900">Super Admin — WhatsApp delivery</p>
              <label className="block text-xs text-muted-foreground" htmlFor={`wa-phone-${tripId}`}>
                Destination (optional override; defaults to{" "}
                <span className="font-mono">{customerPhone || "customer phone"}</span>)
              </label>
              <input
                id={`wa-phone-${tripId}`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                value={overridePhone}
                onChange={(e) => setOverridePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-green-600/40"
              />

              <AnimatePresence mode="wait">
                {sendState === "success" ? (
                  <motion.p key="wa-success" {...fadeSlide} className="text-xs font-medium text-green-700">
                    Invoice delivered on WhatsApp.
                  </motion.p>
                ) : sendState === "error" && sendError ? (
                  <motion.p key="wa-error" {...fadeSlide} className="text-xs font-medium text-red-600">
                    {sendError}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <Button
                type="button"
                size="sm"
                disabled={pending || sendState === "sending" || !canSendWhatsApp}
                className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
                onClick={handleSendWhatsApp}
              >
                {sendState === "sending" ? "Sending via WhatsApp…" : "Send via WhatsApp"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="bg-emerald-800 text-primary-foreground hover:bg-emerald-900"
            disabled={pending}
            onClick={() =>
              run(
                () => generateTripInvoiceManualAction(tripId),
                "Invoice generated. Customer may receive WhatsApp if templates are configured."
              )
            }
          >
            {pending ? "Generating…" : "Generate invoice"}
          </Button>
          <p className="w-full text-xs text-muted-foreground">
            Use this if completion succeeded but automatic invoice creation failed earlier.
          </p>
        </div>
      )}
    </motion.div>
  );
}
