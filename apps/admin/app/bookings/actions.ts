"use server";

import { createCaller } from "@repo/api";
import type { BookingStatus } from "@repo/api";
import { prisma } from "@repo/db";
import { advanceBookingProgress } from "@repo/lib";
import {
  getAuthorizedWhereClause,
  requireAdminResourceAuthz,
} from "../../lib/resource-authz";

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
    const adminCtx = await requireAdminResourceAuthz();
    if (!adminCtx) {
      return { success: false, error: "Forbidden" };
    }

    const where = getAuthorizedWhereClause(adminCtx, { resource: "Booking", targetId: id });
    const result = await prisma.booking.updateMany({
      where,
      data: { status },
    });
    if (result.count === 0) {
      return { success: false, error: "Booking not found." };
    }

    if (status === "CONFIRMED" || status === "PARTNER_ACCEPTED") {
      try {
        await advanceBookingProgress(id, "BOOKING_CONFIRMED");
      } catch (err) {
        console.error("[updateBookingStatusAction] progress_hook_failed", err);
      }
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: message };
  }
}
