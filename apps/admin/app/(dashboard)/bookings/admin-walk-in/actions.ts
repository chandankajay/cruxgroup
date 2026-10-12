"use server";

import { z } from "zod";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";
import { createWalkInBookingCore } from "../new/lib/walk-in-booking-core";
import {
  fetchAssignablePartners,
  fetchPartnerFleetOptions,
} from "../../../platform-admin/partners/passive/actions";
import { walkInBookingFields, walkInCustomerRefine } from "../new/schema";

const adminWalkInSchema = walkInCustomerRefine(
  walkInBookingFields.extend({
    partnerId: z.string().min(1, "Select a partner"),
    assignMode: z.enum(["DIRECT", "PARTNER_REQUEST"]),
  }),
);

export async function fetchAdminWalkInDeskData() {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false as const };

  const { prisma } = await import("@repo/db");
  const [partners, customers] = await Promise.all([
    fetchAssignablePartners(),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, phone: true, gstin: true },
    }),
  ]);

  return { ok: true as const, partners, customers };
}

export { fetchPartnerFleetOptions };

export async function createAdminWalkInBookingAction(
  raw: z.infer<typeof adminWalkInSchema>,
): Promise<
  | { ok: true; bookingId: string; tripId: string | null; notifyFailed?: boolean }
  | { ok: false; error: string }
> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const parsed = adminWalkInSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid form" };
  }

  const { partnerId, assignMode, ...walkIn } = parsed.data;

  try {
    const result = await createWalkInBookingCore(walkIn, {
      origin: "ADMIN_WALK_IN",
      adminAssignMode: assignMode,
      partnerId,
    });
    return {
      ok: true,
      bookingId: result.bookingId,
      tripId: result.tripId,
      ...(result.notifyFailed ? { notifyFailed: true } : {}),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create booking" };
  }
}
