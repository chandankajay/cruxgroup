"use client";

import type { PartnerBusinessDashboard } from "@repo/db";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";

export function formatPartnerInrPaise(paise: number): string {
  const inr = paise / 100;
  return `₹${inr.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function IdleMachineBanner({
  idleMachines,
}: {
  readonly idleMachines: { id: string; name: string }[];
}) {
  if (idleMachines.length === 0) return null;

  return (
    <div
      className="mb-6 w-full rounded-2xl border border-rose-500/60 bg-rose-500/15 p-4 text-rose-50 shadow-sm"
      role="alert"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-6 shrink-0 text-rose-300" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-200/90">
            Idle machines
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            <span className="font-semibold">{idleMachines.length}</span>{" "}
            {idleMachines.length === 1 ? "machine has" : "machines have"} had no booking in the last
            14 days:{" "}
            <span className="font-medium text-white">
              {idleMachines.map((m) => m.name).join(", ")}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function TopCustomersCard({ bi }: { readonly bi: PartnerBusinessDashboard }) {
  return (
    <Card className="select-none border-zinc-800 bg-zinc-800 shadow-md lg:bg-zinc-900/80">
      <CardHeader className="border-b border-zinc-800 pb-4">
        <CardTitle className="text-lg text-zinc-50">Top customers (this month)</CardTitle>
        <CardDescription className="text-sm text-zinc-300">
          By collected revenue (paid invoices)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {bi.topCustomers.length === 0 ? (
          <p className="text-sm text-zinc-400">No payments recorded this month yet.</p>
        ) : (
          <ol className="space-y-3">
            {bi.topCustomers.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-zinc-200">
                  <span className="mr-2 font-mono text-zinc-500">{i + 1}.</span>
                  {c.label}
                </span>
                <span className="shrink-0 font-mono text-sm font-semibold text-amber-400">
                  {formatPartnerInrPaise(c.revenuePaise)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function UtilizationHeatmap({ bi }: { readonly bi: PartnerBusinessDashboard }) {
  if (bi.heatmap.length === 0) {
    return (
      <Card className="select-none border-zinc-800 bg-zinc-800 shadow-md lg:bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-50">Utilisation heatmap</CardTitle>
          <CardDescription className="text-sm text-zinc-300">
            Booked days vs available days in the current month (IST)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">Add equipment to see utilisation.</p>
        </CardContent>
      </Card>
    );
  }

  const dim = bi.heatmap[0]?.daysInMonth ?? 31;
  const dayNums = Array.from({ length: dim }, (_, i) => i + 1);

  return (
    <Card className="select-none border-zinc-800 bg-zinc-800 shadow-md lg:bg-zinc-900/80">
      <CardHeader className="border-b border-zinc-800 pb-4">
        <CardTitle className="text-lg text-zinc-50">Utilisation heatmap</CardTitle>
        <CardDescription className="text-sm text-zinc-300">
          Each cell is one calendar day (IST). Darker = at least one scheduled trip that day.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-4">
        <div className="min-w-[720px]">
          <div
            className="mb-2 grid gap-px"
            style={{
              gridTemplateColumns: `140px repeat(${dim}, minmax(0, 1fr))`,
            }}
          >
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Machine
            </div>
            {dayNums.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-mono text-zinc-500"
              >
                {d}
              </div>
            ))}
          </div>
          {bi.heatmap.map((row) => (
            <div
              key={row.equipmentId}
              className="grid gap-px border-t border-zinc-800/80 py-1"
              style={{
                gridTemplateColumns: `140px repeat(${dim}, minmax(0, 1fr))`,
              }}
            >
              <div className="truncate pr-2 text-xs font-medium text-zinc-200" title={row.name}>
                {row.name}
              </div>
              {row.dayFlags.map((on, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square max-h-7 min-h-4 rounded-sm",
                    on ? "bg-amber-500/90" : "bg-zinc-800/90"
                  )}
                  title={`Day ${i + 1}: ${on ? "booked" : "idle"}`}
                />
              ))}
            </div>
          ))}
          <p className="mt-3 text-xs text-zinc-500">
            Fleet average utilisation this month:{" "}
            <span className="font-mono text-zinc-300">{bi.fleetUtilizationPct}%</span> of days
            booked (average across machines).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

