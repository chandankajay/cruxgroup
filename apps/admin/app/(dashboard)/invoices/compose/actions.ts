"use server";

import { prisma } from "@repo/db";
import { composeManualInvoice } from "@repo/lib/invoice";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";

export type ComposerTripRow = {
  tripId: string;
  label: string;
  customerName: string;
  partnerCompany: string;
  completedAtIso: string | null;
  hasManualInvoice: boolean;
};

export async function fetchComposerTripPicker(): Promise<ComposerTripRow[] | null> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return null;

  const trips = await prisma.trip.findMany({
    where: {
      OR: [{ status: "COMPLETED" }, { isHistorical: true }],
    },
    orderBy: { actualEndTime: "desc" },
    take: 150,
    select: {
      id: true,
      actualEndTime: true,
      scheduledDate: true,
      isHistorical: true,
      equipment: { select: { name: true, category: true } },
      user: { select: { name: true } },
      partner: { select: { companyName: true } },
      booking: { select: { customer: { select: { name: true } } } },
      invoices: { select: { manuallyComposed: true }, take: 1 },
    },
  });

  return trips
    .filter((t) => !t.invoices[0]?.manuallyComposed)
    .map((t) => ({
      tripId: t.id,
      label: `${t.equipment.category} ${t.equipment.name}`,
      customerName: t.booking?.customer?.name || t.user.name || "Customer",
      partnerCompany: t.partner.companyName || "Partner",
      completedAtIso: (t.actualEndTime ?? t.scheduledDate)?.toISOString() ?? null,
      hasManualInvoice: Boolean(t.invoices[0]?.manuallyComposed),
    }));
}

export async function composeInvoiceAction(input: {
  tripId: string;
  paymentStatus: "QUOTATION" | "UNPAID" | "PARTIALLY_PAID" | "PAID";
  lineDescription: string;
  subtotalInr: number;
  discountIsPercent: boolean;
  discountValue: number;
  gstPercent: number;
  customerGstin?: string;
  amountPaidInr?: number;
}): Promise<
  | {
      ok: true;
      invoiceNumber: string;
      customerNotified: boolean;
      adminNotified: boolean;
    }
  | { ok: false; error: string }
> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const subtotalPaise = Math.round(input.subtotalInr * 100);
  const discountValue = input.discountIsPercent
    ? Math.round(input.discountValue)
    : Math.round(input.discountValue * 100);

  const documentType = input.paymentStatus === "QUOTATION" ? "QUOTATION" : "TAX_INVOICE";

  try {
    const result = await composeManualInvoice({
      tripId: input.tripId,
      composedByUserId: ctx.userId,
      paymentStatus: input.paymentStatus,
      documentType,
      lineDescription: input.lineDescription,
      subtotalPaise,
      discountIsPercent: input.discountIsPercent,
      discountValue,
      gstPercent: input.gstPercent,
      customerGstin: input.customerGstin,
      amountPaidPaise: input.amountPaidInr
        ? Math.round(input.amountPaidInr * 100)
        : undefined,
    });

    return {
      ok: true,
      invoiceNumber: result.invoiceNumber,
      customerNotified: result.customerNotified,
      adminNotified: result.adminNotified,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Compose failed" };
  }
}
