import "server-only";

import { Buffer } from "node:buffer";
import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { buildInvoicePdfBytes } from "./build-invoice-pdf";
import { publicBlobPutOptions } from "../blob-storage";

const SAC = "997319";

function computeAmountPaise(trip: {
  totalAmount: number | null;
  totalBilledHours: number | null;
  lockedHourlyRate: number;
}): number {
  if (trip.totalAmount != null && Number.isFinite(trip.totalAmount) && trip.totalAmount > 0) {
    return Math.floor(trip.totalAmount);
  }
  const hours = trip.totalBilledHours ?? 0;
  return Math.max(0, Math.round(hours * trip.lockedHourlyRate));
}

export function isTrustedInvoiceBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("blob.vercel-storage.com")) return false;
    return u.pathname.includes("/invoices/");
  } catch {
    return false;
  }
}

/**
 * Returns an existing invoice PDF URL or generates one from trip data, uploads to Blob, and persists.
 */
export async function ensureInvoicePdfUrl(invoiceId: string): Promise<string | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      trip: {
        include: {
          partner: true,
          equipment: true,
          user: true,
          booking: { include: { customer: true } },
        },
      },
    },
  });
  if (!invoice?.trip) return null;

  const existing = invoice.pdfUrl?.trim() ?? "";
  if (existing && isTrustedInvoiceBlobUrl(existing)) {
    return existing;
  }

  const trip = invoice.trip;
  const amountPaise = invoice.amount > 0 ? invoice.amount : computeAmountPaise(trip);
  if (amountPaise < 1) return null;

  const lineDescription = `${trip.equipment.category} ${trip.equipment.name} — hire charges`;
  const pdfBytes = await buildInvoicePdfBytes({
    invoiceNumber: invoice.invoiceNumber,
    issuedAtIso: invoice.createdAt.toISOString(),
    sacCode: invoice.sacCode || SAC,
    partnerGstin: invoice.partnerGstin,
    customerGstin: invoice.customerGstin,
    amountPaise,
    lineDescription,
    customerName: trip.user.name || "Customer",
    partnerName: trip.partner.companyName || "Partner",
  });

  const blobPath = `invoices/${trip.id}/invoice.pdf`;
  try {
    const blob = await put(blobPath, Buffer.from(pdfBytes), {
      ...publicBlobPutOptions(),
      contentType: "application/pdf",
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfUrl: blob.url },
    });
    return blob.url;
  } catch (e) {
    console.error("[ensureInvoicePdfUrl] blob upload failed", { invoiceId, error: e });
    return null;
  }
}
