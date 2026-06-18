"use client";

import type { SalesStats } from "../actions";

const STATUS_LABELS: Record<keyof SalesStats["byStatus"], string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  CONVERTED: "Converted",
  DEAD: "Dead",
};

export function SalesPerformanceContent({ stats }: { readonly stats: SalesStats }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">My Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your lead pipeline at a glance
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={stats.totalLeads} />
        <StatCard label="Converted" value={stats.totalConverted} accent />
        <StatCard label="This week" value={stats.convertedThisWeek} />
        <StatCard label="This month" value={stats.convertedThisMonth} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-charcoal">By status</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(STATUS_LABELS) as Array<keyof SalesStats["byStatus"]>).map(
          (key) => (
            <div
              key={key}
              className="rounded-xl bg-card px-4 py-3 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {STATUS_LABELS[key]}
              </p>
              <p className="mt-1 text-2xl font-bold text-charcoal">
                {stats.byStatus[key]}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold ${accent ? "text-brand-orange" : "text-charcoal"}`}
      >
        {value}
      </p>
    </div>
  );
}
