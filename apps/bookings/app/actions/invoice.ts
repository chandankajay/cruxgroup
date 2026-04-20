"use server";

import { generateInvoiceForCompletedTrip } from "../../lib/invoice/generate-invoice-for-trip";

/**
 * Idempotent: generates invoice + payment link + notifications if missing for a completed trip.
 * Intended for server-side replay (e.g. after configuring Blob / Razorpay / AiSensy).
 */
export async function generateInvoiceForTripAction(
  tripId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await generateInvoiceForCompletedTrip(tripId);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invoice generation failed";
    return { ok: false, error: message };
  }
}
