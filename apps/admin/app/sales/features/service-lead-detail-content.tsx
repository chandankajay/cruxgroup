"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ServiceLeadStage } from "@prisma/client";
import {
  SERVICE_CATALOG_LABELS,
  SERVICE_LEAD_STAGE_LABELS,
  SERVICE_LEAD_STAGES,
} from "@repo/lib";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import {
  markQuotationSentAdminAction,
  requestQuoteAdminHandoffAction,
} from "../../../(dashboard)/services-leads/actions";
import {
  appendLeadNoteAction,
  updateServiceLeadStageSalesAction,
  type LeadDetail,
} from "../actions";

export function ServiceLeadDetailContent({ lead }: { readonly lead: LeadDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [note, setNote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [amount, setAmount] = useState(
    lead.quoteAmountPaise ? String(lead.quoteAmountPaise / 100) : "",
  );
  const [billbookRef, setBillbookRef] = useState(lead.billbookRef ?? "");
  const [sentDate, setSentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const stage = lead.serviceStage ?? "NEW";

  function changeStage(next: ServiceLeadStage) {
    const lostReason =
      next === "LOST" ? window.prompt("Lost reason?") ?? undefined : undefined;
    startTransition(async () => {
      const result = await updateServiceLeadStageSalesAction(lead.id, next, lostReason);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await appendLeadNoteAction(lead.id, note);
      if (!result.success) setError(result.error);
      else {
        setNote("");
        router.refresh();
      }
    });
  }

  function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    const rupees = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(rupees) || rupees <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const result = await markQuotationSentAdminAction({
        leadId: lead.id,
        amountPaise: Math.round(rupees * 100),
        sentAt: new Date(sentDate),
        billbookRef,
      });
      if (!result.ok) setError(result.error);
      else {
        setShowQuote(false);
        router.refresh();
      }
    });
  }

  function handoffToAdmin() {
    startTransition(async () => {
      const result = await requestQuoteAdminHandoffAction(lead.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const serviceLabel =
    lead.serviceSlug &&
    SERVICE_CATALOG_LABELS[lead.serviceSlug as keyof typeof SERVICE_CATALOG_LABELS];

  return (
    <div>
      <Link
        href="/sales/leads?leadType=SERVICE"
        className="mb-4 inline-block text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← My service leads
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.phoneNumber}
            {lead.whatsappOptIn ? " · prefers WhatsApp" : ""}
          </p>
          {lead.areaLabel ? (
            <p className="mt-2 text-sm">{lead.areaLabel}</p>
          ) : null}
          {lead.landSize ? (
            <p className="text-sm text-muted-foreground">
              {lead.landSize}
              {lead.timeline ? ` · ${lead.timeline}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceLabel ? <Badge className="bg-amber-500">{serviceLabel}</Badge> : null}
          <Badge variant="outline">{SERVICE_LEAD_STAGE_LABELS[stage]}</Badge>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild>
          <a href={`tel:${lead.phoneNumber}`}>Call</a>
        </Button>
        <Button type="button" variant="outline" className="border-emerald-600 text-emerald-700" asChild>
          <a
            href={`https://wa.me/91${lead.phoneNumber.replace(/\D/g, "").slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </Button>
        {lead.canSendQuotes ? (
          <Button type="button" className="bg-amber-500 hover:bg-amber-600" onClick={() => setShowQuote(true)}>
            Mark quotation sent
          </Button>
        ) : (
          <Button type="button" variant="secondary" disabled={pending || lead.quoteHandoffRequested} onClick={handoffToAdmin}>
            {lead.quoteHandoffRequested ? "Sent to admin" : "Send to admin"}
          </Button>
        )}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Pipeline stage</h2>
          <Select
            value={stage}
            onChange={(e) => changeStage(e.target.value as ServiceLeadStage)}
            disabled={pending}
          >
            {SERVICE_LEAD_STAGES.map((s) => (
              <option key={s} value={s}>{SERVICE_LEAD_STAGE_LABELS[s]}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Activity</h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {lead.activities.map((a) => (
              <li key={a.id} className="border-b border-border/40 pb-2">
                <p>{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={addNote} className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 font-semibold">Notes</h2>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        <Button type="submit" className="mt-3" disabled={pending}>Add note</Button>
        <ul className="mt-4 space-y-3">
          {lead.notes.map((n) => (
            <li key={n.id} className="text-sm">
              <p>{n.text}</p>
              <p className="text-xs text-muted-foreground">
                {n.authorName} · {new Date(n.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ul>
      </form>

      {showQuote ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <form
            onSubmit={submitQuote}
            className="w-full max-w-md rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
          >
            <h2 className="text-lg font-semibold">Mark Quotation sent</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create the quotation in Billbook, then record it here.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="q-amount">Quoted amount (₹, incl. GST) *</Label>
                <Input id="q-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="q-date">Date sent *</Label>
                <Input id="q-date" type="date" value={sentDate} onChange={(e) => setSentDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="q-bb">Billbook reference *</Label>
                <Input id="q-bb" value={billbookRef} onChange={(e) => setBillbookRef(e.target.value)} required />
                <p className="text-xs text-muted-foreground">Invoice/estimate number from Billbook</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowQuote(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={pending}>Mark as sent</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
