import "server-only";

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Buffer } from "node:buffer";
import { put } from "@vercel/blob";
import { prisma } from "@repo/db";
import { sendManualInvoiceAdminNotifyWhatsApp } from "../aisensy";
import { buildInvoicePdfBytes, type InvoicePdfInput } from "./build-invoice-pdf";
import { publicBlobPutOptions } from "../blob-storage";
import { dispatchInvoiceReceiptWhatsApp } from "./send-invoice-receipt-whatsapp";
import { buildSignedInvoicePdfUrl } from "./invoice-delivery-url";
import { formatInvoiceNumber, formatQuotationNumber, indianFyKeyUtc } from "./invoice-number";

const SAC = "997319";

export type ComposeManualInvoiceInput = {
  tripId: string;
  composedByUserId: string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "QUOTATION";
  documentType: "TAX_INVOICE" | "QUOTATION";
  lineDescription: string;
  subtotalPaise: number;
  discountIsPercent: boolean;
  discountValue: number;
  gstPercent: number;
  customerGstin?: string | null;
  amountPaidPaise?: number;
};

export type ComposeManualInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string;
  pdfUrl: string;
  grandTotalPaise: number;
  customerNotified: boolean;
  adminNotified: boolean;
};

function computeDiscountPaise(
  subtotalPaise: number,
  discountIsPercent: boolean,
  discountValue: number,
): number {
  if (discountValue <= 0) return 0;
  if (discountIsPercent) {
    return Math.min(subtotalPaise, Math.round((subtotalPaise * discountValue) / 100));
  }
  return Math.min(subtotalPaise, discountValue);
}

function paymentStatusRibbon(
  status: ComposeManualInvoiceInput["paymentStatus"],
): string | null {
  switch (status) {
    case "QUOTATION":
      return "QUOTATION";
    case "PAID":
      return "PAID";
    case "PARTIALLY_PAID":
      return "PARTIALLY PAID";
    default:
      return null;
  }
}

async function allocateDocumentNumber(
  documentType: ComposeManualInvoiceInput["documentType"],
): Promise<string> {
  const fyKey = indianFyKeyUtc(new Date());
  const row = await prisma.invoiceCounter.upsert({
    where: { fyKey },
    create: { fyKey, lastSeq: 1 },
    update: { lastSeq: { increment: 1 } },
  });
  return documentType === "QUOTATION"
    ? formatQuotationNumber(fyKey, row.lastSeq)
    : formatInvoiceNumber(fyKey, row.lastSeq);
}

async function loadLogoBytes(): Promise<Uint8Array | undefined> {
  const candidates = [
    join(process.cwd(), "public", "logo.png"),
    join(process.cwd(), "apps", "admin", "public", "logo.png"),
  ];
  for (const path of candidates) {
    try {
      const buf = await readFile(path);
      return new Uint8Array(buf);
    } catch {
      /* try next */
    }
  }
  return undefined;
}

/**
 * Super Admin manual invoice composer — PDF upload, persist row, dual WhatsApp.
 * Idempotent per trip: skips if a manually composed invoice already exists.
 */
export async function composeManualInvoice(
  input: ComposeManualInvoiceInput,
): Promise<ComposeManualInvoiceResult> {
  const existing = await prisma.invoice.findUnique({ where: { tripId: input.tripId } });
  if (existing?.manuallyComposed) {
    throw new Error("A manual invoice already exists for this trip.");
  }
  if (existing && !existing.manuallyComposed) {
    throw new Error("An auto-generated invoice exists for this trip. Contact support to replace it.");
  }

  const trip = await prisma.trip.findUnique({
    where: { id: input.tripId },
    include: {
      partner: true,
      equipment: true,
      user: true,
      booking: { include: { customer: true } },
    },
  });

  if (!trip) throw new Error("Trip not found");
  if (trip.status !== "COMPLETED" && !trip.isHistorical) {
    throw new Error("Invoice composer requires a completed trip.");
  }

  const subtotalPaise = Math.max(0, Math.floor(input.subtotalPaise));
  const discountPaise = computeDiscountPaise(
    subtotalPaise,
    input.discountIsPercent,
    input.discountValue,
  );
  const taxableBase = Math.max(0, subtotalPaise - discountPaise);
  const gstPaise = Math.round((taxableBase * input.gstPercent) / 100);
  const grandTotalPaise = taxableBase + gstPaise;

  if (grandTotalPaise < 1 && input.paymentStatus !== "QUOTATION") {
    throw new Error("Grand total must be at least ₹0.01 for tax invoices.");
  }

  const invoiceNumber = await allocateDocumentNumber(input.documentType);
  const partnerGstin = trip.partner.gstNumber?.trim() || null;
  const customerGstin =
    input.customerGstin?.trim() || trip.booking?.customer?.gstin?.trim() || null;

  const pdfInput: InvoicePdfInput = {
    invoiceNumber,
    issuedAtIso: new Date().toISOString(),
    sacCode: SAC,
    partnerGstin,
    customerGstin,
    amountPaise: grandTotalPaise,
    subtotalPaise,
    discountPaise,
    gstPercent: input.gstPercent,
    gstPaise,
    lineDescription: input.lineDescription.trim(),
    customerName: trip.booking?.customer?.name || trip.user.name || "Customer",
    partnerName: trip.partner.companyName || "Partner",
    documentTitle:
      input.documentType === "QUOTATION" ? "Crux Group — Quotation" : "Crux Group — Tax Invoice",
    statusRibbon: paymentStatusRibbon(input.paymentStatus),
    logoPngBytes: await loadLogoBytes(),
  };

  const pdfBytes = await buildInvoicePdfBytes(pdfInput);
  const blobPath = `invoices/${trip.id}/${invoiceNumber.replace(/\//g, "-")}.pdf`;
  const blob = await put(blobPath, Buffer.from(pdfBytes), {
    ...publicBlobPutOptions(),
    contentType: "application/pdf",
  });

  let reviewToken = trip.reviewToken?.trim();
  if (!reviewToken) {
    reviewToken = randomUUID();
    await prisma.trip.update({ where: { id: trip.id }, data: { reviewToken } });
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      tripId: trip.id,
      documentType: input.documentType,
      lineDescription: input.lineDescription.trim(),
      subtotalPaise,
      discountPaise,
      discountIsPercent: input.discountIsPercent,
      discountValue: input.discountValue,
      gstPercent: input.gstPercent,
      gstPaise,
      amountPaidPaise: input.amountPaidPaise ?? 0,
      partnerGstin,
      customerGstin,
      sacCode: SAC,
      amount: grandTotalPaise,
      pdfUrl: blob.url,
      paymentStatus: input.paymentStatus,
      manuallyComposed: true,
      composedByUserId: input.composedByUserId,
    },
  });

  const customerPhone =
    trip.booking?.customer?.phone?.trim() || trip.user.phoneNumber?.trim() || "";

  // AiSensy fetches PDF via signed admin proxy (works locally with ADMIN_PUBLIC_URL + ngrok).
  const whatsAppPdfUrl = buildSignedInvoicePdfUrl(invoice.id);

  // FUTURE FIX: branch on documentType when AISENSY_WA_QUOTATION_CAMPAIGN is set.
  let customerNotified = false;
  if (customerPhone) {
    customerNotified = await dispatchInvoiceReceiptWhatsApp({
      customerPhone,
      pdfUrl: whatsAppPdfUrl,
      invoiceNumber,
      reviewToken,
    });
    if (customerNotified) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { sentToCustomerAt: new Date() },
      });
    }
  }

  const grandTotalInr = (grandTotalPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const adminNotified = await sendManualInvoiceAdminNotifyWhatsApp({
    invoiceNumber,
    customerName: pdfInput.customerName,
    grandTotalInr,
    pdfUrl: whatsAppPdfUrl,
  });
  if (adminNotified) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { sentToAdminAt: new Date() },
    });
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber,
    pdfUrl: blob.url,
    grandTotalPaise,
    customerNotified,
    adminNotified,
  };
}
