"use server";

import { prisma } from "@repo/db";
import { generateInvoiceForCompletedTrip, ensureInvoicePdfUrl } from "@repo/lib/invoice";
import { deliverInvoiceViaWhatsApp, sendInvoiceReceiptForTrip } from "../../../lib/invoice-whatsapp-delivery";
import {
  getAuthorizedWhereClause,
  getResourceAuthzContext,
} from "../../../lib/resource-authz";

async function requireTripForInvoiceAction(
  tripId: string
): Promise<{ ok: false; error: string } | { ok: true; tripId: string }> {
  const ctx = await getResourceAuthzContext();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const where = getAuthorizedWhereClause(ctx, { resource: "Trip", targetId: tripId });
  const trip = await prisma.trip.findFirst({
    where,
    select: { id: true, status: true },
  });
  if (!trip) return { ok: false, error: "Trip not found" };
  if (trip.status !== "COMPLETED") {
    return { ok: false, error: "Invoice actions are only available for completed trips." };
  }
  return { ok: true, tripId: trip.id };
}

export async function resendTripInvoicePaymentLinkAction(
  tripId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireTripForInvoiceAction(tripId);
  if (!gate.ok) return gate;

  const invoice = await prisma.invoice.findUnique({
    where: { tripId: gate.tripId },
    include: {
      trip: { include: { user: { select: { phoneNumber: true } } } },
    },
  });
  if (!invoice) {
    return { ok: false, error: "No invoice on file for this trip. Use Generate invoice first." };
  }

  const pdfUrl = (await ensureInvoicePdfUrl(invoice.id)) ?? "";
  const phone = invoice.trip.user.phoneNumber?.trim() ?? "";
  if (!pdfUrl) {
    return { ok: false, error: "Invoice PDF is missing; regenerate may be required." };
  }
  if (!phone) {
    return { ok: false, error: "Customer phone is missing; cannot send WhatsApp." };
  }

  try {
    const sent = await sendInvoiceReceiptForTrip({
      tripId: gate.tripId,
      customerPhone: phone,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl,
    });
    if (!sent) {
      return { ok: false, error: "Failed to send invoice notification." };
    }
  } catch (e) {
    console.error("[resendTripInvoicePaymentLinkAction] aisensy_failed", {
      tripId: gate.tripId,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: "Failed to send invoice notification." };
  }

  return { ok: true };
}

/** Super Admin only — manual invoice delivery via WhatsApp (PDF + ratings link). */
export async function sendTripInvoiceWhatsAppAction(
  tripId: string,
  destinationPhone?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await deliverInvoiceViaWhatsApp({ tripId, destinationPhone });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export async function generateTripInvoiceManualAction(
  tripId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireTripForInvoiceAction(tripId);
  if (!gate.ok) return gate;

  try {
    await generateInvoiceForCompletedTrip(gate.tripId);
  } catch (e) {
    console.error("[generateTripInvoiceManualAction] generation_threw", {
      tripId: gate.tripId,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: "Invoice generation failed. Check server logs." };
  }

  const created = await prisma.invoice.findUnique({
    where: { tripId: gate.tripId },
    select: { id: true },
  });
  if (!created) {
    return {
      ok: false,
      error:
        "No invoice was created (zero amount, missing config, or partial failure). Check server logs.",
    };
  }

  return { ok: true };
}
