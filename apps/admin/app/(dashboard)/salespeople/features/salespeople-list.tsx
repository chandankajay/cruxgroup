"use client";

import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import type { SalespersonRow } from "../actions";

type Props = {
  readonly salespeople: SalespersonRow[];
};

export function SalespeopleList({ salespeople }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salespeople</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage salesperson logins and quote permissions.
          </p>
        </div>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
          <Link href="/salespeople/new">+ New salesperson</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Areas</th>
              <th className="px-4 py-3 font-medium">Open leads</th>
              <th className="px-4 py-3 font-medium">Quotes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {salespeople.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No salespeople yet. Create one to assign service leads.
                </td>
              </tr>
            ) : (
              salespeople.map((sp) => (
                <tr key={sp.id} className="border-t border-border/40">
                  <td className="px-4 py-3 font-medium">{sp.name}</td>
                  <td className="px-4 py-3">{sp.phoneNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sp.assignedAreaSlugs.length > 0
                      ? sp.assignedAreaSlugs.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{sp.openLeads}</td>
                  <td className="px-4 py-3">
                    {sp.canSendQuotes ? (
                      <Badge variant="secondary">Can quote</Badge>
                    ) : (
                      <span className="text-muted-foreground">Admin handoff</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {sp.isActive ? (
                      <Badge className="bg-emerald-600/15 text-emerald-700">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/salespeople/${sp.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
