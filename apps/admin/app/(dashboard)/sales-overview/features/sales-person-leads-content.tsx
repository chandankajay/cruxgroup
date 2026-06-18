"use client";

import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import type { LeadRow, LeadNoteRow } from "../../../sales/actions";

type AdminLeadRow = LeadRow & { notes: LeadNoteRow[] };

export function SalesPersonLeadsContent({
  salesPerson,
  leads,
}: {
  readonly salesPerson: { id: string; name: string; phoneNumber: string | null };
  readonly leads: AdminLeadRow[];
}) {
  return (
    <div>
      <Link
        href="/sales-overview"
        className="mb-4 inline-block text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to sales overview
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">{salesPerson.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {salesPerson.phoneNumber ?? "—"} · {leads.length} leads (read-only)
        </p>
      </div>

      <div className="space-y-6">
        {leads.length === 0 ? (
          <p className="text-muted-foreground">No leads for this sales person.</p>
        ) : (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">{lead.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {lead.phoneNumber} ·{" "}
                    {lead.leadType === "FLEET_PARTNER" ? "Fleet partner" : "Customer"}
                  </p>
                </div>
                <Badge>{lead.status}</Badge>
              </div>
              {lead.source ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Source: {lead.source}
                </p>
              ) : null}
              {lead.notes.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-charcoal">Notes</h3>
                  <ul className="space-y-2">
                    {lead.notes.map((n) => (
                      <li
                        key={n.id}
                        className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
                      >
                        <p>{n.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {n.authorName} ·{" "}
                          {new Date(n.createdAt).toLocaleString("en-IN")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes.</p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
