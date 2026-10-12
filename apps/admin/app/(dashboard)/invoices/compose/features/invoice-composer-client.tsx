"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { composeInvoiceAction, type ComposerTripRow } from "../actions";

function fmtInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function InvoiceComposerClient({
  trips,
  initialTripId,
}: {
  readonly trips: ComposerTripRow[];
  readonly initialTripId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [tripId, setTripId] = useState(initialTripId ?? trips[0]?.tripId ?? "");
  const [paymentStatus, setPaymentStatus] = useState<
    "QUOTATION" | "UNPAID" | "PARTIALLY_PAID" | "PAID"
  >("UNPAID");
  const [lineDescription, setLineDescription] = useState("");
  const [subtotalInr, setSubtotalInr] = useState(0);
  const [discountIsPercent, setDiscountIsPercent] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [customerGstin, setCustomerGstin] = useState("");
  const [amountPaidInr, setAmountPaidInr] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "success">("idle");

  const selected = trips.find((t) => t.tripId === tripId);

  const { discountPaise, gstPaise, grandTotalPaise } = useMemo(() => {
    const sub = Math.round(subtotalInr * 100);
    const disc = discountIsPercent
      ? Math.min(sub, Math.round((sub * discountValue) / 100))
      : Math.min(sub, Math.round(discountValue * 100));
    const taxable = Math.max(0, sub - disc);
    const gst = Math.round((taxable * gstPercent) / 100);
    return { discountPaise: disc, gstPaise: gst, grandTotalPaise: taxable + gst };
  }, [subtotalInr, discountIsPercent, discountValue, gstPercent]);

  const statusBanner =
    paymentStatus === "QUOTATION"
      ? "QUOTATION"
      : paymentStatus === "PAID"
        ? "PAID"
        : paymentStatus === "PARTIALLY_PAID"
          ? "PARTIALLY PAID"
          : "UNPAID";

  const submit = () => {
    if (!tripId) {
      toast.error("Select a trip");
      return;
    }
    startTransition(async () => {
      const res = await composeInvoiceAction({
        tripId,
        paymentStatus,
        lineDescription,
        subtotalInr,
        discountIsPercent,
        discountValue,
        gstPercent,
        customerGstin,
        amountPaidInr: paymentStatus === "PARTIALLY_PAID" ? amountPaidInr : undefined,
      });
      if (res.ok) {
        setSubmitState("success");
        toast.success(`Invoice ${res.invoiceNumber} sent`);
        window.setTimeout(() => setSubmitState("idle"), 3000);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Create / send invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manual composer — PDF + WhatsApp to customer and super-admin notify number.
          </p>
        </div>
        <Link
          href="/invoices"
          className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm font-medium"
        >
          Back to outbox
        </Link>
      </header>

      <div className="rounded-lg border border-dashed border-brand-blue/40 bg-brand-blue/5 px-4 py-2 text-center text-sm font-semibold uppercase tracking-wide text-brand-blue">
        Preview banner: {statusBanner}
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label>Trip / job</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
          >
            <option value="">Select completed trip…</option>
            {trips.map((t) => (
              <option key={t.tripId} value={t.tripId}>
                {t.label} · {t.customerName} · {t.partnerCompany}
              </option>
            ))}
          </select>
          {selected ? (
            <p className="text-xs text-muted-foreground">
              {selected.customerName} — {selected.partnerCompany}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Payment status</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as typeof paymentStatus)
            }
          >
            <option value="QUOTATION">Quotation</option>
            <option value="UNPAID">Unpaid (tax invoice)</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="PAID">Completely paid</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Booking detail</Label>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={lineDescription}
            onChange={(e) => setLineDescription(e.target.value)}
            placeholder="Machine, site, dates, partner…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Subtotal (₹)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={subtotalInr || ""}
              onChange={(e) => setSubtotalInr(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>GST %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={gstPercent}
              onChange={(e) => setGstPercent(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Discount</Label>
            <div className="flex gap-2">
              <select
                className="h-11 rounded-md border border-input bg-background px-2 text-sm"
                value={discountIsPercent ? "pct" : "inr"}
                onChange={(e) => setDiscountIsPercent(e.target.value === "pct")}
              >
                <option value="inr">₹</option>
                <option value="pct">%</option>
              </select>
              <Input
                type="number"
                min={0}
                className="flex-1"
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Customer GSTIN (optional)</Label>
            <Input value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value)} />
          </div>
        </div>

        {paymentStatus === "PARTIALLY_PAID" ? (
          <div className="space-y-2">
            <Label>Amount received (₹)</Label>
            <Input
              type="number"
              min={0}
              value={amountPaidInr || ""}
              onChange={(e) => setAmountPaidInr(Number(e.target.value))}
            />
          </div>
        ) : null}

        <dl className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>{fmtInr(discountPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>GST</dt>
            <dd>{fmtInr(gstPaise)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-charcoal">
            <dt>Grand total</dt>
            <dd>{fmtInr(grandTotalPaise)}</dd>
          </div>
        </dl>

        <AnimatePresence mode="wait">
          <motion.div key={submitState} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }}>
            <Button
              className="w-full"
              disabled={pending || submitState === "success"}
              onClick={submit}
            >
              {pending
                ? "Sending…"
                : submitState === "success"
                  ? "Sent ✓"
                  : "Generate PDF & send WhatsApp"}
            </Button>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
