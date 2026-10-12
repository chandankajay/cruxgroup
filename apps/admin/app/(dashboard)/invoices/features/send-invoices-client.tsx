"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import type { InvoiceOutboxRow } from "../actions";
import {
  generateTripInvoiceManualAction,
  sendTripInvoiceWhatsAppAction,
} from "../../jobs/trip-invoice-actions";

const istFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "short",
});

function fmtInr(paise: number | null): string {
  if (paise == null) return "—";
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function InvoiceOutboxCard({
  row,
  onRefresh,
}: {
  readonly row: InvoiceOutboxRow;
  readonly onRefresh: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [sendState, setSendState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendError, setSendError] = useState<string>();
  const [overridePhone, setOverridePhone] = useState("");

  const handleSend = useCallback(() => {
    setSendError(undefined);
    setSendState("sending");
    startTransition(async () => {
      const trimmed = overridePhone.replace(/\D/g, "");
      const res = await sendTripInvoiceWhatsAppAction(
        row.tripId,
        trimmed.length >= 10 ? overridePhone : undefined
      );
      if (res.ok) {
        setSendState("success");
        toast.success(`Invoice sent to ${row.customerName}.`);
        onRefresh();
        window.setTimeout(() => setSendState("idle"), 2400);
      } else {
        setSendState("error");
        setSendError(res.error);
        toast.error(res.error);
        window.setTimeout(() => setSendState("idle"), 3200);
      }
    });
  }, [row.tripId, row.customerName, overridePhone, onRefresh]);

  const handleGenerate = useCallback(() => {
    startTransition(async () => {
      const res = await generateTripInvoiceManualAction(row.tripId);
      if (res.ok) {
        toast.success("Invoice generated.");
        onRefresh();
      } else {
        toast.error(res.error);
      }
    });
  }, [row.tripId, onRefresh]);

  const hasInvoice = row.invoiceId != null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">
            {row.invoiceNumber ?? "No invoice yet"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-charcoal">{row.customerName}</h3>
          <p className="font-mono text-sm text-muted-foreground">{row.customerPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-charcoal">{fmtInr(row.amountPaise)}</p>
          {row.paymentStatus ? (
            <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase">
              {row.paymentStatus.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="sr-only">Machine</dt>
          <dd>{row.machineLabel}</dd>
        </div>
        <div>
          <dt className="sr-only">Partner</dt>
          <dd>{row.partnerCompany}</dd>
        </div>
        {row.completedAtIso ? (
          <div className="sm:col-span-2">
            <dt className="sr-only">Completed</dt>
            <dd>Completed {istFmt.format(new Date(row.completedAtIso))} IST</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {hasInvoice ? (
          <>
            <div className="flex flex-wrap gap-2">
              {row.pdfUrl ? (
                <a
                  href={row.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
                >
                  View PDF
                </a>
              ) : (
                <span className="text-xs text-amber-800">PDF will be generated on send.</span>
              )}
            </div>

            <label className="block text-xs text-muted-foreground" htmlFor={`phone-${row.tripId}`}>
              WhatsApp destination (optional — defaults to customer phone)
            </label>
            <input
              id={`phone-${row.tripId}`}
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              value={overridePhone}
              onChange={(e) => setOverridePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-green-600/40"
            />

            <AnimatePresence mode="wait">
              {sendState === "success" ? (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-green-700"
                >
                  Sent — PDF bill + ratings link delivered on WhatsApp.
                </motion.p>
              ) : sendState === "error" && sendError ? (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-red-600"
                >
                  {sendError}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <Button
              type="button"
              disabled={pending || sendState === "sending"}
              className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
              onClick={handleSend}
            >
              {sendState === "sending" ? "Sending via WhatsApp…" : "Send via WhatsApp"}
            </Button>
          </>
        ) : (
          <Button type="button" disabled={pending} onClick={handleGenerate}>
            {pending ? "Generating…" : "Generate invoice"}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

export function SendInvoicesClient({ rows }: { readonly rows: InvoiceOutboxRow[] }) {
  const router = useRouter();
  const onRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        No completed trips yet. Invoices appear here after jobs are marked complete.
      </div>
    );
  }

  const withInvoice = rows.filter((r) => r.invoiceId != null);
  const withoutInvoice = rows.filter((r) => r.invoiceId == null);

  return (
    <div className="space-y-8">
      {withInvoice.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-charcoal">Ready to send</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {withInvoice.map((row) => (
              <InvoiceOutboxCard key={row.tripId} row={row} onRefresh={onRefresh} />
            ))}
          </div>
        </section>
      ) : null}

      {withoutInvoice.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-charcoal">Needs invoice generation</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {withoutInvoice.map((row) => (
              <InvoiceOutboxCard key={row.tripId} row={row} onRefresh={onRefresh} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
