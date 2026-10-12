"use server";

import { z } from "zod";
import { requireAdminResourceAuthz } from "../../../../../lib/resource-authz";
import { createWalkInBookingCore } from "../../new/lib/walk-in-booking-core";
import { naiveIstLocalToUtc } from "../../new/lib/ist-datetime";
import { walkInBookingFields, walkInCustomerRefine } from "../../new/schema";
import { ensureHistoricalEquipment } from "./lib/ensure-historical-equipment";
import { getMasterCatalog } from "../../../../fleet/lib/catalog";

const historicalFields = walkInBookingFields
  .omit({ equipmentId: true })
  .extend({
    partnerId: z.string().min(1, "Select a partner"),
    catalogId: z.string().min(1, "Select a machine type from the master catalog"),
    equipmentId: z.string().optional(),
    actualStartLocal: z.string().min(1, "Actual start is required"),
    actualEndLocal: z.string().min(1, "Actual end is required"),
    assignMode: z.enum(["DIRECT", "PARTNER_REQUEST"]).default("DIRECT"),
  });

const historicalSchema = walkInCustomerRefine(historicalFields).superRefine((data, ctx) => {
  try {
    const start = naiveIstLocalToUtc(data.actualStartLocal);
    const end = naiveIstLocalToUtc(data.actualEndLocal);
    if (end.getTime() <= start.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Actual end must be after actual start",
        path: ["actualEndLocal"],
      });
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid actual start or end date/time",
      path: ["actualStartLocal"],
    });
  }
});

function formatZodError(error: z.ZodError): string {
  const flat = error.flatten();
  const fieldMsg = Object.entries(flat.fieldErrors)
    .flatMap(([key, msgs]) => (msgs ?? []).map((m) => `${key}: ${m}`))
    .find(Boolean);
  return flat.formErrors[0] ?? fieldMsg ?? "Invalid form";
}

export async function fetchMasterCatalogForHistorical() {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return [];
  return getMasterCatalog();
}

export async function createHistoricalJobAction(
  raw: z.infer<typeof historicalSchema>,
): Promise<{ ok: true; bookingId: string; tripId: string } | { ok: false; error: string }> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { ok: false, error: "Unauthorized" };

  const parsed = historicalSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const { actualStartLocal, actualEndLocal, assignMode, partnerId, catalogId, equipmentId, ...walkIn } =
    parsed.data;

  let resolvedEquipmentId: string;
  try {
    resolvedEquipmentId = await ensureHistoricalEquipment({
      partnerId,
      catalogId,
      equipmentId,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not resolve equipment" };
  }

  try {
    const result = await createWalkInBookingCore(
      { ...walkIn, equipmentId: resolvedEquipmentId },
      {
        origin: "HISTORICAL",
        adminAssignMode: assignMode,
        silent: true,
        historical: { actualStartLocal, actualEndLocal },
        partnerId,
      },
    );
    if (!result.tripId) return { ok: false, error: "Historical trip was not created" };
    return { ok: true, bookingId: result.bookingId, tripId: result.tripId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save record" };
  }
}
