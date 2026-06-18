"use client";

import Link from "next/link";
import type { SalesPersonSummary } from "../../../sales/actions";

export function SalesOverviewContent({
  salesPeople,
}: {
  readonly salesPeople: SalesPersonSummary[];
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Sales Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All sales people, lead counts, and conversions (read-only)
        </p>
      </div>

      {salesPeople.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-12 text-center text-muted-foreground shadow-sm">
          No sales people registered yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-charcoal/5 text-left">
                <th className="px-4 py-3 font-semibold text-charcoal">Sales person</th>
                <th className="px-4 py-3 font-semibold text-charcoal">Total leads</th>
                <th className="px-4 py-3 font-semibold text-charcoal">Converted</th>
                <th className="px-4 py-3 font-semibold text-charcoal">Pipeline</th>
                <th className="px-4 py-3 font-semibold text-charcoal" />
              </tr>
            </thead>
            <tbody>
              {salesPeople.map((sp) => {
                const active =
                  sp.byStatus.NEW +
                  sp.byStatus.CONTACTED +
                  sp.byStatus.INTERESTED;
                return (
                  <tr key={sp.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sp.phoneNumber ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">{sp.totalLeads}</td>
                    <td className="px-4 py-3 font-semibold text-brand-orange">
                      {sp.totalConverted}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{active} active</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sales-overview/${sp.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View leads
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
