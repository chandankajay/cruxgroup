"use server";

import { prisma } from "@repo/db";
import { generateInvoiceForCompletedTrip } from "@repo/lib/invoice";
import { sendInvoiceWithPaymentLinkWhatsApp } from "@repo/lib/aisensy";
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
      trip: { include: { user: { select: { name: true, phoneNumber: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!invoice) {
    return { ok: false, error: "No invoice on file for this trip. Use Generate invoice first." };
  }

  const pdfUrl = invoice.pdfUrl?.trim() ?? "";
  const paymentUrl = invoice.payments[0]?.paymentLinkUrl?.trim() ?? "";
  const phone = invoice.trip.user.phoneNumber?.trim() ?? "";
  if (!pdfUrl || !paymentUrl) {
    return { ok: false, error: "Invoice PDF or payment link is missing; regenerate may be required." };
  }
  if (!phone) {
    return { ok: false, error: "Customer phone is missing; cannot send WhatsApp." };
  }

  try {
    await sendInvoiceWithPaymentLinkWhatsApp({
      customerPhone: phone,
      customerName: invoice.trip.user.name || "Customer",
      invoiceNumber: invoice.invoiceNumber,
      amountInrLabel: (invoice.amount / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      pdfUrl,
      paymentUrl,
    });
  } catch (e) {
    console.error("[resendTripInvoicePaymentLinkAction] aisensy_failed", {
      tripId: gate.tripId,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: "Failed to send payment link notification." };
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
