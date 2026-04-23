import "server-only";

import { Buffer } from "node:buffer";
import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { sendInvoiceWithPaymentLinkWhatsApp } from "../aisensy";
import { buildInvoicePdfBytes } from "./build-invoice-pdf";
import { formatInvoiceNumber, indianFyKeyUtc } from "./invoice-number";
import { createRazorpayPaymentLink } from "./razorpay-payment-link";

const SAC = "997319";

/** `totalAmount` and `lockedHourlyRate` on Trip are stored in paise. */
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

async function allocateInvoiceNumber(): Promise<string> {
  const fyKey = indianFyKeyUtc(new Date());
  const row = await prisma.invoiceCounter.upsert({
    where: { fyKey },
    create: { fyKey, lastSeq: 1 },
    update: { lastSeq: { increment: 1 } },
  });
  return formatInvoiceNumber(fyKey, row.lastSeq);
}

/**
 * Runs after a trip is COMPLETED. Idempotent per trip (unique invoice per trip).
 */
export async function generateInvoiceForCompletedTrip(tripId: string): Promise<void> {
  const existing = await prisma.invoice.findUnique({ where: { tripId } });
  if (existing) return;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      partner: true,
      equipment: true,
      user: true,
      booking: { include: { customer: true } },
    },
  });

  if (!trip || trip.status !== "COMPLETED") return;

  const amountPaise = computeAmountPaise(trip);
  if (amountPaise < 1) {
    console.warn("[invoice] skip zero amount trip", tripId);
    return;
  }

  const invoiceNumber = await allocateInvoiceNumber();

  const partnerGstin = trip.partner.gstNumber?.trim() || null;
  const customerGstin = trip.booking?.customer?.gstin?.trim() || null;

  const lineDescription = `${trip.equipment.category} ${trip.equipment.name} — hire charges`;

  const pdfBytes = await buildInvoicePdfBytes({
    invoiceNumber,
    issuedAtIso: new Date().toISOString(),
    sacCode: SAC,
    partnerGstin,
    customerGstin,
    amountPaise,
    lineDescription,
    customerName: trip.user.name || "Customer",
    partnerName: trip.partner.companyName || "Partner",
  });

  const blobPath = `invoices/${tripId}/invoice.pdf`;
  let pdfUrl: string | null = null;
  try {
    const blob = await put(blobPath, Buffer.from(pdfBytes), {
      access: "public",
      contentType: "application/pdf",
    });
    pdfUrl = blob.url;
  } catch (e) {
    console.error("[invoice] blob upload failed", e);
    return;
  }

  const razorpay = await createRazorpayPaymentLink({
    amountPaise,
    referenceId: invoiceNumber,
    description: `Invoice ${invoiceNumber}`,
    customerName: trip.user.name || "Customer",
    customerContact: trip.user.phoneNumber ?? "",
  });

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        tripId: trip.id,
        partnerGstin,
        customerGstin,
        sacCode: SAC,
        amount: amountPaise,
        pdfUrl,
        paymentStatus: "UNPAID",
      },
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        razorpayLinkId: razorpay?.id ?? null,
        paymentLinkUrl: razorpay?.shortUrl ?? null,
        amountPaid: 0,
        status: razorpay ? "PENDING" : "FAILED",
      },
    });
  } catch (e) {
    console.error("[invoice] db create failed", e);
    return;
  }

  const phone = trip.user.phoneNumber;
  if (phone?.trim() && pdfUrl && razorpay?.shortUrl) {
    await sendInvoiceWithPaymentLinkWhatsApp({
      customerPhone: phone,
      customerName: trip.user.name || "Customer",
      invoiceNumber,
      amountInrLabel: (amountPaise / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      pdfUrl,
      paymentUrl: razorpay.shortUrl,
    });
  }
}
