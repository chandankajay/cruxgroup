"use server";

import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../lib/resource-authz";

export type InvoiceOutboxRow = {
  tripId: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  customerName: string;
  customerPhone: string;
  partnerCompany: string;
  machineLabel: string;
  amountPaise: number | null;
  paymentStatus: string | null;
  pdfUrl: string | null;
  completedAtIso: string | null;
};

export async function fetchInvoiceOutbox(): Promise<InvoiceOutboxRow[] | null> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return null;

  const trips = await prisma.trip.findMany({
    where: { status: "COMPLETED" },
    orderBy: { actualEndTime: "desc" },
    take: 100,
    select: {
      id: true,
      actualEndTime: true,
      equipment: { select: { name: true, category: true } },
      user: { select: { name: true, phoneNumber: true } },
      partner: { select: { companyName: true } },
      invoices: {
        take: 1,
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          paymentStatus: true,
          pdfUrl: true,
        },
      },
    },
  });

  return trips.map((trip) => {
    const inv = trip.invoices[0] ?? null;
    return {
      tripId: trip.id,
      invoiceId: inv?.id ?? null,
      invoiceNumber: inv?.invoiceNumber ?? null,
      customerName: trip.user.name || "Customer",
      customerPhone: trip.user.phoneNumber || "—",
      partnerCompany: trip.partner.companyName || "Partner",
      machineLabel: `${trip.equipment.category} · ${trip.equipment.name}`,
      amountPaise: inv?.amount ?? null,
      paymentStatus: inv?.paymentStatus ?? null,
      pdfUrl: inv?.pdfUrl ?? null,
      completedAtIso: trip.actualEndTime?.toISOString() ?? null,
    };
  });
}
