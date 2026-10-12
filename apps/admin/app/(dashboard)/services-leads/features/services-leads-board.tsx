"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SERVICE_LEAD_STAGE_LABELS,
  SERVICE_LEAD_STAGES,
  SERVICE_CATALOG_LABELS,
  type ServiceLeadStageId,
} from "@repo/lib";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  assignServiceLeadAction,
  type ServiceLeadCard,
} from "../actions";

type Board = Record<ServiceLeadStageId, ServiceLeadCard[]>;

type SalespersonOption = {
  id: string;
  name: string;
  assignedAreaSlugs: string[];
  openCount: number;
};

type Props = {
  readonly board: Board;
  readonly salespeople: SalespersonOption[];
  readonly filters: {
    area?: string;
    serviceSlug?: string;
    salesPersonId?: string;
    search?: string;
  };
};

export function ServicesLeadsBoard({ board, salespeople, filters }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [assignQuery, setAssignQuery] = useState("");

  function applyFilter(key: string, value: string) {
    const sp = new URLSearchParams();
    if (filters.area) sp.set("area", filters.area);
    if (filters.serviceSlug) sp.set("service", filters.serviceSlug);
    if (filters.salesPersonId) sp.set("sales", filters.salesPersonId);
    if (filters.search) sp.set("q", filters.search);
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/services-leads?${sp.toString()}`);
  }

  function assign(leadId: string, salesPersonId: string) {
    startTransition(async () => {
      const result = await assignServiceLeadAction(leadId, salesPersonId);
      if (result.ok) {
        setAssignLeadId(null);
        router.refresh();
      }
    });
  }

  const filteredSales = salespeople.filter((sp) =>
    assignQuery
      ? sp.name.toLowerCase().includes(assignQuery.toLowerCase())
      : true,
  );

  const openTotal = SERVICE_LEAD_STAGES.reduce(
    (sum, stage) =>
      stage === "COMPLETED" || stage === "LOST" ? sum : sum + board[stage].length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services leads</h1>
          <p className="text-sm text-muted-foreground">
            {openTotal} open · pipeline within 50 km of Fatimapur, Kothur
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/services-leads?view=list">List</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, phone, village…"
          className="max-w-xs"
          defaultValue={filters.search ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilter("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
        <Input
          placeholder="Filter area"
          className="max-w-[140px]"
          defaultValue={filters.area ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilter("area", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {SERVICE_LEAD_STAGES.map((stage) => (
          <div
            key={stage}
            className="min-w-[240px] max-w-[260px] shrink-0 rounded-xl border border-border/60 bg-muted/20"
          >
            <div className="border-b border-border/50 px-3 py-2">
              <p className="text-sm font-semibold">
                {SERVICE_LEAD_STAGE_LABELS[stage]}{" "}
                <span className="text-muted-foreground">({board[stage].length})</span>
              </p>
            </div>
            <ul className="space-y-2 p-2">
              {board[stage].map((card) => (
                <li
                  key={card.id}
                  className="rounded-lg border border-border/50 bg-card p-3 text-sm shadow-sm"
                >
                  <p className="font-semibold">{card.name}</p>
                  <p className="text-muted-foreground">
                    {card.serviceSlug
                      ? SERVICE_CATALOG_LABELS[
                          card.serviceSlug as keyof typeof SERVICE_CATALOG_LABELS
                        ] ?? card.serviceSlug
                      : "Service"}{" "}
                    {card.landSize ? `· ${card.landSize}` : ""}
                  </p>
                  {card.areaLabel ? (
                    <p className="mt-1 text-xs text-muted-foreground">📍 {card.areaLabel}</p>
                  ) : null}
                  {card.quoteAmountPaise && stage === "QUOTATION_SENT" ? (
                    <p className="mt-1 text-xs">
                      ₹{(card.quoteAmountPaise / 100).toLocaleString("en-IN")}
                      {card.billbookRef ? ` · ${card.billbookRef}` : ""}
                    </p>
                  ) : null}
                  {stage === "LOST" && card.lostReason ? (
                    <p className="mt-1 text-xs text-red-600">{card.lostReason}</p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {card.salesPersonName ? (
                      <Badge variant="secondary">{card.salesPersonName}</Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-amber-600"
                        disabled={pending}
                        onClick={() => setAssignLeadId(card.id)}
                      >
                        + Assign
                      </Button>
                    )}
                    <Link
                      href={`/sales/leads/${card.id}`}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {assignLeadId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-title"
        >
          <div className="w-full max-w-md rounded-xl bg-card p-4 shadow-xl">
            <h2 id="assign-title" className="text-lg font-semibold">Assign salesperson</h2>
            <Input
              className="mt-3"
              placeholder="Search salespeople…"
              value={assignQuery}
              onChange={(e) => setAssignQuery(e.target.value)}
            />
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {filteredSales.map((sp) => (
                <li key={sp.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-border/50 px-3 py-2 text-left hover:bg-muted/50"
                    disabled={pending}
                    onClick={() => assign(assignLeadId, sp.id)}
                  >
                    <span className="font-medium">{sp.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {sp.assignedAreaSlugs.join(", ") || "No areas"} · {sp.openCount} open
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => setAssignLeadId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
