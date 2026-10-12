import "server-only";

import { randomUUID } from "node:crypto";
import { prisma } from "@repo/db";
import { sendSuperAdminInvoiceWhatsApp, normalizeWhatsAppDestination } from "@repo/lib/aisensy";
import { ensureInvoicePdfUrl, dispatchInvoiceReceiptWhatsApp, buildSignedInvoicePdfUrl } from "@repo/lib/invoice";
import { buildCustomerReviewLink } from "@repo/lib/review-link";
import { requireAdminResourceAuthz } from "./resource-authz";
import { ADMIN_PHONE_E164, normalizeAdminPhone } from "./phone";

export type SendInvoiceWhatsAppResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 403 | 404 | 502 };

async function ensureTripReviewToken(tripId: string): Promise<string | null> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { reviewToken: true },
  });
  if (!trip) return null;
  if (trip.reviewToken?.trim()) return trip.reviewToken.trim();
  const token = randomUUID();
  await prisma.trip.update({ where: { id: tripId }, data: { reviewToken: token } });
  return token;
}

/**
 * Super-admin only: deliver invoice PDF attachment + ratings link via WhatsApp.
 * Invoice metadata (number, amount, payment) is embedded in the PDF only.
 */
export async function deliverInvoiceViaWhatsApp(params: {
  tripId: string;
  destinationPhone?: string;
}): Promise<SendInvoiceWhatsAppResult> {
  const adminCtx = await requireAdminResourceAuthz();
  if (!adminCtx) {
    return { ok: false, error: "Forbidden — Super Admin access required.", status: 403 };
  }

  const tripId = params.tripId.trim();
  if (!tripId || tripId.length > 64) {
    return { ok: false, error: "Invalid trip id.", status: 400 };
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId },
    select: { id: true, status: true },
  });
  if (!trip) {
    return { ok: false, error: "Trip not found.", status: 404 };
  }
  if (trip.status !== "COMPLETED") {
    return {
      ok: false,
      error: "Invoice WhatsApp delivery is only available for completed trips.",
      status: 400,
    };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { tripId },
    include: {
      trip: { include: { user: { select: { name: true, phoneNumber: true } } } },
    },
  });
  if (!invoice) {
    return {
      ok: false,
      error: "No invoice on file for this trip. Generate an invoice first.",
      status: 404,
    };
  }

  const pdfUrl = await ensureInvoicePdfUrl(invoice.id);
  if (!pdfUrl) {
    return {
      ok: false,
      error: "Could not resolve or generate the invoice PDF.",
      status: 502,
    };
  }

  const reviewToken = await ensureTripReviewToken(tripId);
  if (!reviewToken) {
    return { ok: false, error: "Could not resolve customer review link.", status: 502 };
  }

  const fallbackPhone = invoice.trip.user.phoneNumber?.trim() ?? "";
  const rawPhone = params.destinationPhone?.trim() || fallbackPhone;
  if (!rawPhone) {
    return { ok: false, error: "Customer phone is missing; provide a destination number.", status: 400 };
  }

  const normalizedPhone = normalizeAdminPhone(rawPhone);
  if (!ADMIN_PHONE_E164.test(normalizedPhone)) {
    return { ok: false, error: "Destination phone number is not valid.", status: 400 };
  }

  const whatsAppDestination = normalizeWhatsAppDestination(normalizedPhone);
  const ratingsLink = buildCustomerReviewLink(reviewToken);

  try {
    const sent = await sendSuperAdminInvoiceWhatsApp({
      destinationPhone: whatsAppDestination,
      pdfUrl: buildSignedInvoicePdfUrl(invoice.id),
      pdfFilename: `Crux-Invoice-${invoice.invoiceNumber.replace(/[^\w.-]+/g, "_")}.pdf`,
      ratingsLink,
    });
    if (!sent) {
      return { ok: false, error: "WhatsApp provider rejected the delivery request.", status: 502 };
    }
  } catch (e) {
    console.error("[deliverInvoiceViaWhatsApp] aisensy_failed", {
      tripId,
      adminUserId: adminCtx.userId,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: "Failed to send invoice via WhatsApp.", status: 502 };
  }

  return { ok: true };
}

/** Shared send path for partner resend + auto-generation (non-admin callers supply auth separately). */
export async function sendInvoiceReceiptForTrip(params: {
  tripId: string;
  customerPhone: string;
  invoiceId: string;
  invoiceNumber: string;
  pdfUrl: string;
}): Promise<boolean> {
  const reviewToken = await ensureTripReviewToken(params.tripId);
  if (!reviewToken) return false;
  return dispatchInvoiceReceiptWhatsApp({
    customerPhone: params.customerPhone,
    pdfUrl: buildSignedInvoicePdfUrl(params.invoiceId),
    invoiceNumber: params.invoiceNumber,
    reviewToken,
  });
}
