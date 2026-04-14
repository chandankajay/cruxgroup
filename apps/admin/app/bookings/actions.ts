"use server";

import { createCaller } from "@repo/api";
import type { BookingStatus } from "@repo/api";

const caller = createCaller({});

export type BookingRow = Awaited<ReturnType<typeof fetchBookings>>[number];

export async function fetchBookings() {
  try {
    return await caller.booking.getAll();
  } catch {
    return [];
  }
}

export async function updateBookingStatusAction(
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
