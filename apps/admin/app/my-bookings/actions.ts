"use server";

import { createCaller } from "@repo/api";
import type { BookingStatus } from "@repo/api";

const caller = createCaller({});

export type PartnerBookingRow = Awaited<
  ReturnType<typeof fetchPartnerBookings>
>[number];

export async function fetchPartnerBookings(partnerId: string) {
  try {
    return await caller.booking.getByPartner({ partnerId });
  } catch {
    return [];
  }
}

export async function updatePartnerBookingStatusAction(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await caller.booking.updateStatus({ id, status });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: message };
  }
}
