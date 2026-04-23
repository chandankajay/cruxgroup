"use server";

import { createCaller } from "@repo/api";
import type { BookingStatus } from "@repo/api";
import { prisma } from "@repo/db";
import {
  getAuthorizedWhereClause,
  getResourceAuthzContext,
} from "../../lib/resource-authz";

const caller = createCaller({});

export type PartnerBookingRow = Awaited<
  ReturnType<typeof fetchPartnerBookings>
>[number];

/**
 * Resolves the signed-in user to their {@link Partner} row, then returns inbound
 * rental requests (PENDING within service radius, plus any non-pending history)
 * for that partner’s equipment.
 */
export async function fetchPartnerBookings(userId: string) {
  try {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!partner) {
      return [];
    }
    return await caller.booking.getByPartner({ partnerId: partner.id });
  } catch {
    return [];
  }
}

export async function updatePartnerBookingStatusAction(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await getResourceAuthzContext();
    if (!ctx || ctx.role !== "PARTNER") {
      return { success: false, error: "Unauthorized" };
    }

    const where = getAuthorizedWhereClause(ctx, { resource: "Booking", targetId: id });
    const result = await prisma.booking.updateMany({
      where,
      data: { status },
    });
    if (result.count === 0) {
      return { success: false, error: "Booking not found or access denied." };
    }
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: message };
  }
}
