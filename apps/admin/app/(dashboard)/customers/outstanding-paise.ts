import type { Invoice, Payment } from "@prisma/client";

/**
 * Pure helper (not a Server Action). Kept outside `"use server"` files because
 * Next.js only allows async exports from Server Action modules.
 */
export function outstandingPaiseForInvoice(
  invoice: Pick<Invoice, "amount"> & {
    payments: Pick<Payment, "amountPaid" | "status">[];
  }
): number {
  const paid = invoice.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amountPaid, 0);
  return Math.max(0, invoice.amount - paid);
}
