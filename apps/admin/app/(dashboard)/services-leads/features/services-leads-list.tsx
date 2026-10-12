"use client";

import Link from "next/link";
import {
  SERVICE_CATALOG_LABELS,
  SERVICE_LEAD_STAGE_LABELS,
} from "@repo/lib/service-leads";
import type { ServiceLeadCard } from "../actions";

type Props = {
  readonly leads: ServiceLeadCard[];
  readonly salespeople: { id: string; name: string }[];
  readonly filters: Record<string, string | undefined>;
};

export function ServicesLeadsList({ leads, filters }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services leads — list</h1>
        <Link
          href="/services-leads"
          className="inline-flex rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Board
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Service</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/sales/leads/${l.id}`} className="font-medium hover:underline">
                    {l.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {l.serviceSlug
                    ? SERVICE_CATALOG_LABELS[
                        l.serviceSlug as keyof typeof SERVICE_CATALOG_LABELS
                      ]
                    : "—"}
                </td>
                <td className="px-3 py-2">{l.areaLabel ?? "—"}</td>
                <td className="px-3 py-2">
                  {SERVICE_LEAD_STAGE_LABELS[l.serviceStage]}
                </td>
                <td className="px-3 py-2">{l.salesPersonName ?? "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filters.search ? (
        <p className="text-xs text-muted-foreground">Filtered view</p>
      ) : null}
    </div>
  );
}
