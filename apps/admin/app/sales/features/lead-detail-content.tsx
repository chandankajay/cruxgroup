"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import {
  appendLeadNoteAction,
  convertLeadAction,
  searchBookingsForLink,
  updateLeadStatusAction,
  type BookingLookupRow,
  type LeadDetail,
} from "../actions";

const STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "CONVERTED",
  "DEAD",
];

export function LeadDetailContent({ lead }: { readonly lead: LeadDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [bookingQuery, setBookingQuery] = useState(lead.phoneNumber);
  const [bookingOptions, setBookingOptions] = useState<BookingLookupRow[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    lead.bookingId ?? "",
  );
  const [showConvert, setShowConvert] = useState(false);

  useEffect(() => {
    if (!showConvert || bookingQuery.length < 2) {
      setBookingOptions([]);
      return;
    }
    const t = setTimeout(() => {
      void searchBookingsForLink(bookingQuery).then(setBookingOptions);
    }, 300);
    return () => clearTimeout(t);
  }, [bookingQuery, showConvert]);

  function updateStatus(status: LeadStatus) {
    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, status);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await appendLeadNoteAction(lead.id, note);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNote("");
      router.refresh();
    });
  }

  function markConverted() {
    startTransition(async () => {
      const result = await convertLeadAction(
        lead.id,
        selectedBookingId || undefined,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowConvert(false);
      router.refresh();
    });
  }

  return (
    <div>
      <Link
        href="/sales/leads"
        className="mb-4 inline-block text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to leads
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.phoneNumber} ·{" "}
            {lead.leadType === "FLEET_PARTNER" ? "Fleet partner" : "Customer"}
          </p>
          {lead.source ? (
            <p className="mt-2 text-sm text-muted-foreground">Source: {lead.source}</p>
          ) : null}
        </div>
        <Badge>{lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}</Badge>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Update status</h2>
          <Select
            value={lead.status}
            onChange={(e) => updateStatus(e.target.value as LeadStatus)}
            disabled={pending || lead.status === "CONVERTED"}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>

          {lead.status !== "CONVERTED" ? (
            <div className="mt-4">
              {!showConvert ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConvert(true)}
                >
                  Mark as converted / booked
                </Button>
              ) : (
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Optionally link an existing booking (search by phone, customer, or
                    partner name).
                  </p>
                  <div>
                    <Label htmlFor="booking-search">Search bookings</Label>
                    <Input
                      id="booking-search"
                      value={bookingQuery}
                      onChange={(e) => setBookingQuery(e.target.value)}
                    />
                  </div>
                  {bookingOptions.length > 0 ? (
                    <Select
                      value={selectedBookingId || "none"}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedBookingId(v === "none" ? "" : v);
                      }}
                    >
                      <option value="none">No booking link</option>
                      {bookingOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label} — {new Date(b.createdAt).toLocaleDateString("en-IN")}
                        </option>
                      ))}
                    </Select>
                  ) : null}
                  <div className="flex gap-2">
                    <Button type="button" disabled={pending} onClick={markConverted}>
                      Confirm converted
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowConvert(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : lead.bookingId ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Linked booking: {lead.bookingId}
            </p>
          ) : null}
        </div>

        <form onSubmit={addNote} className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Add note</h2>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Follow-up details, call summary…"
            rows={4}
          />
          <Button type="submit" className="mt-3" disabled={pending || !note.trim()}>
            Append note
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Notes log</h2>
        {lead.notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="space-y-4">
            {lead.notes.map((n) => (
              <li key={n.id} className="border-b border-border pb-4 last:border-0">
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.authorName} · {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
