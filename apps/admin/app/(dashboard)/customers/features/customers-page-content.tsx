"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import type { CrmCustomerRow } from "../actions";

function fmtInrFromPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface CustomersPageContentProps {
  readonly rows: CrmCustomerRow[];
}

export function CustomersPageContent({ rows }: CustomersPageContentProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        No customers yet. Add one from the walk-in booking desk or seed data.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-charcoal/5">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Name
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Company
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Phone
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-charcoal">
            Outstanding
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-charcoal">
            Credit limit
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-charcoal">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const overCredit =
            row.creditLimit > 0 && row.outstandingPaise > row.creditLimit;
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-charcoal">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">{row.company || "—"}</TableCell>
              <TableCell className="font-mono text-sm">{row.phone}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    overCredit
                      ? "font-semibold text-red-700"
                      : "text-charcoal"
                  }
                >
                  {fmtInrFromPaise(row.outstandingPaise)}
                </span>
                {overCredit ? (
                  <span
                    className="ml-2 inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800"
                    title="Outstanding exceeds approved credit limit"
                  >
                    Over limit
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.creditLimit > 0 ? fmtInrFromPaise(row.creditLimit) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/customers/${row.id}`}
                  className="text-sm font-medium text-brand-orange underline-offset-4 hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
