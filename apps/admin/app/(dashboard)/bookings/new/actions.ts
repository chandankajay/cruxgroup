"use server";

import { randomInt } from "node:crypto";
import { prisma } from "@repo/db";
import {
  sendBookingConfirmationWhatsApp,
  sendOperatorMagicLink,
} from "@repo/lib/aisensy";
import { auth } from "../../../../lib/auth";
import {
  getAuthorizedWhereClause,
  toResourceAuthzContext,
} from "../../../../lib/resource-authz";
import { normalizeAdminPhone } from "../../../../lib/phone";
import { naiveIstLocalToUtc, utcToNaiveIstLocalForInput } from "./lib/ist-datetime";
import {
  computeWalkInQuote,
  distanceJobToPartnerKm,
  partnerBaseCoords,
  type CatalogGuards,
} from "./lib/walk-in-pricing";
import {
  walkInBookingSchema,
  walkInRescheduleSchema,
  type WalkInBookingValues,
  type WalkInRescheduleValues,
} from "./schema";

type WalkInDeskActor =
  | { readonly kind: "ADMIN"; readonly userId: string }
  | { readonly kind: "PARTNER"; readonly userId: string; readonly partnerId: string };

async function requireWalkInDesk(): Promise<WalkInDeskActor | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === "ADMIN") {
    return { kind: "ADMIN", userId };
  }
  if (role === "PARTNER") {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!partner) return null;
    return { kind: "PARTNER", userId, partnerId: partner.id };
  }
  return null;
}

function randomOtp4(): string {
  return String(randomInt(1000, 10000));
}

function bookingsAppOrigin(): string {
  return (
    process.env["BOOKINGS_APP_ORIGIN"] ??
    process.env["NEXT_PUBLIC_BOOKINGS_URL"] ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export type WalkInEquipmentOption = {
  id: string;
  name: string;
  category: string;
  partnerId: string;
  hourlyBase: number;
  dailyBase: number;
  catalog: CatalogGuards | null;
  partnerBaseLocation: string | null;
  operatorPhone: string;
  operatorName: string;
};

export async function fetchWalkInDeskData(): Promise<{
  ok: boolean;
  customers: { id: string; name: string; company: string; phone: string; gstin: string | null }[];
  equipment: WalkInEquipmentOption[];
}> {
  const actor = await requireWalkInDesk();
  if (!actor) return { ok: false, customers: [], equipment: [] };

  const customersPromise = prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true, phone: true, gstin: true },
  });

  const equipmentWhere =
    actor.kind === "ADMIN"
      ? { partnerId: { not: null }, isActive: true }
      : { partnerId: actor.partnerId, isActive: true };

  const equipmentRows = await prisma.equipment.findMany({
    where: equipmentWhere,
    include: {
      catalog: {
        select: {
          minHourlyRate: true,
          maxHourlyRate: true,
          minDailyRate: true,
          maxDailyRate: true,
        },
      },
      partner: { select: { baseLocation: true } },
    },
    orderBy: { name: "asc" },
  });

  const customers = await customersPromise;

  const equipment: WalkInEquipmentOption[] = equipmentRows.map((e) => {
    const hourlyBase =
      e.hourlyRate > 0 ? e.hourlyRate : e.pricing.hourly;
    const dailyBase = e.pricing.daily;
    const catalog = e.catalog
      ? {
          minHourlyRate: e.catalog.minHourlyRate,
          maxHourlyRate: e.catalog.maxHourlyRate,
          minDailyRate: e.catalog.minDailyRate,
          maxDailyRate: e.catalog.maxDailyRate,
        }
      : null;
    return {
      id: e.id,
      name: e.name,
      category: e.category,
      partnerId: e.partnerId!,
      hourlyBase,
      dailyBase,
      catalog,
      partnerBaseLocation: e.partner?.baseLocation ?? null,
      operatorPhone: e.operatorPhone,
      operatorName: e.operatorName,
    };
  });

  return { ok: true, customers, equipment };
}

export async function checkEquipmentAvailabilityAction(input: {
  equipmentId: string;
  startLocal: string;
  endLocal: string;
  /** When rescheduling, ignore overlap with this booking row. */
  ignoreBookingId?: string;
  /** When rescheduling, ignore overlap with this trip row. */
  ignoreTripId?: string;
}): Promise<{ available: boolean; error?: string }> {
  const actor = await requireWalkInDesk();
  if (!actor) return { available: false, error: "Unauthorized" };

  if (actor.kind === "PARTNER") {
    const owned = await prisma.equipment.findFirst({
      where: { id: input.equipmentId, partnerId: actor.partnerId },
      select: { id: true },
    });
    if (!owned) return { available: false, error: "Unauthorized" };
  }

  let start: Date;
  let end: Date;
  try {
    start = naiveIstLocalToUtc(input.startLocal);
    end = naiveIstLocalToUtc(input.endLocal);
  } catch {
    return { available: false, error: "Invalid dates" };
  }
  if (end.getTime() <= start.getTime()) {
    return { available: false, error: "End must be after start" };
  }

  const bookingOverlap = await prisma.booking.count({
    where: {
      equipmentId: input.equipmentId,
      status: { not: "CANCELLED" },
      startDate: { not: null },
      endDate: { not: null },
      AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      ...(input.ignoreBookingId ? { id: { not: input.ignoreBookingId } } : {}),
    },
  });

  /** Interval overlap: existing_start < new_end AND existing_end > new_start */
  const tripOverlap = await prisma.trip.count({
    where: {
      equipmentId: input.equipmentId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      ...(input.ignoreTripId ? { id: { not: input.ignoreTripId } } : {}),
      OR: [
        {
          expectedEndTime: { not: null },
          AND: [{ scheduledDate: { lt: end } }, { expectedEndTime: { gt: start } }],
        },
        {
          expectedEndTime: null,
          scheduledDate: { gte: start, lt: end },
        },
      ],
    },
  });

  return { available: bookingOverlap === 0 && tripOverlap === 0 };
}

export async function createQuickCustomerAction(input: {
  name: string;
  phone: string;
  company?: string;
  gstin?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await requireWalkInDesk();
  if (!actor) return { ok: false, error: "Unauthorized" };

  const phone = normalizeAdminPhone(input.phone);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return { ok: false, error: "Invalid phone number" };
  }

  try {
    const row = await prisma.customer.create({
      data: {
        name: input.name.trim(),
        phone,
        company: input.company?.trim() ?? "",
        gstin: input.gstin?.trim() || null,
      },
      select: { id: true },
    });
    return { ok: true, id: row.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create customer";
    return { ok: false, error: message };
  }
}

export async function createWalkInBookingAction(
  raw: WalkInBookingValues
): Promise<
  | { ok: true; bookingId: string; tripId: string; notifyFailed?: boolean }
  | { ok: false; error: string }
> {
  const actor = await requireWalkInDesk();
  if (!actor) return { ok: false, error: "Unauthorized" };

  const parsed = walkInBookingSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid form";
    return { ok: false, error: msg };
  }
  const data = parsed.data;

  let start: Date;
  let end: Date;
  try {
    start = naiveIstLocalToUtc(data.startLocal);
    end = naiveIstLocalToUtc(data.endLocal);
  } catch {
    return { ok: false, error: "Invalid date/time" };
  }
  if (end.getTime() <= start.getTime()) {
    return { ok: false, error: "End must be after start" };
  }

  const availability = await checkEquipmentAvailabilityAction({
    equipmentId: data.equipmentId,
    startLocal: data.startLocal,
    endLocal: data.endLocal,
  });
  if (!availability.available) {
    return { ok: false, error: availability.error ?? "Machine is not available in this window" };
  }

  const equipmentWhere = getAuthorizedWhereClause(toResourceAuthzContext(actor), {
    resource: "Equipment",
    targetId: data.equipmentId,
  });
  const equipment = await prisma.equipment.findFirst({
    where: equipmentWhere,
    include: {
      catalog: {
        select: {
          minHourlyRate: true,
          maxHourlyRate: true,
          minDailyRate: true,
          maxDailyRate: true,
        },
      },
      partner: { select: { id: true, baseLocation: true, gstNumber: true } },
    },
  });

  if (!equipment?.partnerId || !equipment.partner) {
    return { ok: false, error: "Equipment must belong to a partner" };
  }

  const partnerId = equipment.partnerId;

  const hourlyBase =
    equipment.hourlyRate > 0 ? equipment.hourlyRate : equipment.pricing.hourly;
  const dailyBase = equipment.pricing.daily;
  const catalog = equipment.catalog
    ? {
        minHourlyRate: equipment.catalog.minHourlyRate,
        maxHourlyRate: equipment.catalog.maxHourlyRate,
        minDailyRate: equipment.catalog.minDailyRate,
        maxDailyRate: equipment.catalog.maxDailyRate,
      }
    : null;

  const base = partnerBaseCoords(equipment.partner.baseLocation);
  const distanceKm = distanceJobToPartnerKm(
    { lat: data.lat, lng: data.lng },
    base
  );

  const quote = computeWalkInQuote({
    hourlyBase,
    dailyBase,
    pricingUnit: data.pricingUnit,
    duration: data.duration,
    catalog,
    distanceKm,
  });

  let customerId: string;
  let customerName: string;
  let customerPhone: string;

  if (data.mode === "existing") {
    const c = await prisma.customer.findUnique({
      where: { id: data.customerId! },
    });
    if (!c) return { ok: false, error: "Customer not found" };
    customerId = c.id;
    customerName = c.name;
    customerPhone = c.phone;
  } else {
    const phone = normalizeAdminPhone(data.newPhone!);
    const created = await prisma.customer.create({
      data: {
        name: data.newName!.trim(),
        phone,
        company: data.newCompany?.trim() ?? "",
        gstin: data.newGstin?.trim() || null,
      },
    });
    customerId = created.id;
    customerName = created.name;
    customerPhone = created.phone;
  }

  const customerUserPhone = normalizeAdminPhone(customerPhone);

  const platformUser = await prisma.user.upsert({
    where: { phoneNumber: customerUserPhone },
    create: {
      phoneNumber: customerUserPhone,
      name: customerName,
      role: "USER",
    },
    update: { name: customerName },
    select: { id: true },
  });

  const startOtp = randomOtp4();
  const endOtp = randomOtp4();

  const jobLocation = {
    address: data.siteAddress,
    lat: data.lat,
    lng: data.lng,
  };

  let result: {
    booking: { id: string };
    trip: { id: string; operatorToken: string };
  };
  try {
    result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: platformUser.id,
          equipmentId: equipment.id,
          partnerId,
          customerId,
          status: "CONFIRMED",
          startDate: start,
          endDate: end,
          siteAddress: data.siteAddress,
          expectedShift: data.expectedShift?.trim() || null,
          quoteAmount: quote.totalPaise,
          location: {
            address: data.siteAddress,
            pincode: data.pincode,
            coordinates: { lat: data.lat, lng: data.lng },
          },
          pricing: {
            total: quote.totalPaise,
            duration: data.duration,
            unit: data.pricingUnit,
          },
        },
      });

      const trip = await tx.trip.create({
        data: {
          userId: platformUser.id,
          equipmentId: equipment.id,
          partnerId,
          bookingId: booking.id,
          scheduledDate: start,
          expectedEndTime: end,
          status: "ENROUTE",
          startOtp,
          endOtp,
          lockedHourlyRate: quote.unitRatePaise,
          lockedTransportFee: quote.transportFeePaise,
          totalAmount: quote.totalPaise,
          jobLocation,
          distanceKm,
        },
      });

      return { booking, trip };
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create booking";
    return { ok: false, error: message };
  }

  const origin = bookingsAppOrigin();
  const operatorLink = `${origin}/operator/${result.trip.operatorToken}`;
  const jobLabel = `${equipment.category} ${equipment.name}`.trim();

  let notifyFailed = false;
  try {
    if (equipment.operatorPhone?.trim()) {
      const ok = await sendOperatorMagicLink({
        operatorPhone: equipment.operatorPhone,
        jobLabel,
        magicLinkUrl: operatorLink,
        startOtp,
      });
      if (!ok) notifyFailed = true;
    }

    const okCustomer = await sendBookingConfirmationWhatsApp({
      customerPhone: customerPhone,
      customerName,
      equipmentName: equipment.name,
      siteAddress: data.siteAddress,
      scheduledIstLabel: new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(start),
      totalInrLabel: `₹${quote.totalRupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    });
    if (!okCustomer) notifyFailed = true;
  } catch (e) {
    console.error("[walk-in] WhatsApp notification error after booking commit", e);
    notifyFailed = true;
  }

  return {
    ok: true,
    bookingId: result.booking.id,
    tripId: result.trip.id,
    ...(notifyFailed ? { notifyFailed: true } : {}),
  };
}

export type WalkInReschedulePayloadOk = {
  bookingId: string;
  tripId: string;
  formDefaults: WalkInBookingValues;
};

export async function loadWalkInReschedulePayload(
  bookingId: string
): Promise<{ ok: true; data: WalkInReschedulePayloadOk } | { ok: false; error: string }> {
  const actor = await requireWalkInDesk();
  if (!actor) return { ok: false, error: "Unauthorized" };

  const ctx = toResourceAuthzContext(actor);
  const bookingWhere = getAuthorizedWhereClause(ctx, {
    resource: "Booking",
    targetId: bookingId,
  });

  const booking = await prisma.booking.findFirst({
    where: bookingWhere,
    include: {
      trips: {
        where: { status: { in: ["SCHEDULED", "ENROUTE", "ON_SITE", "OVERRUN"] } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!booking) return { ok: false, error: "Booking not found" };
  const trip = booking.trips[0];
  if (!trip) {
    return { ok: false, error: "No active trip to reschedule (job may already be finished)." };
  }

  const endInstant = trip.expectedEndTime ?? booking.endDate;
  if (!endInstant) {
    return { ok: false, error: "Booking is missing an end time; contact support." };
  }
  if (!booking.customerId) {
    return {
      ok: false,
      error: "Reschedule from this desk requires a CRM customer on the booking.",
    };
  }

  const startLocal = utcToNaiveIstLocalForInput(trip.scheduledDate);
  const endLocal = utcToNaiveIstLocalForInput(endInstant);
  const unit = booking.pricing.unit === "daily" ? "daily" : "hourly";

  const formDefaults: WalkInBookingValues = {
    mode: "existing",
    customerId: booking.customerId,
    newName: "",
    newPhone: "",
    newCompany: "",
    newGstin: "",
    equipmentId: booking.equipmentId,
    siteAddress: booking.siteAddress ?? booking.location.address,
    pincode: booking.location.pincode,
    lat: booking.location.coordinates.lat,
    lng: booking.location.coordinates.lng,
    pricingUnit: unit,
    duration: booking.pricing.duration,
    startLocal,
    endLocal,
    expectedShift: booking.expectedShift ?? "DAY",
  };

  return {
    ok: true,
    data: { bookingId: booking.id, tripId: trip.id, formDefaults },
  };
}

export async function updateWalkInBookingScheduleAction(
  raw: WalkInRescheduleValues
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWalkInDesk();
  if (!actor) return { ok: false, error: "Unauthorized" };

  const parsed = walkInRescheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid input" };
  }
  const data = parsed.data;

  let start: Date;
  let end: Date;
  try {
    start = naiveIstLocalToUtc(data.startLocal);
    end = naiveIstLocalToUtc(data.endLocal);
  } catch {
    return { ok: false, error: "Invalid date/time" };
  }
  if (end.getTime() <= start.getTime()) {
    return { ok: false, error: "End must be after start" };
  }

  const ctx = toResourceAuthzContext(actor);
  const bookingWhere = getAuthorizedWhereClause(ctx, {
    resource: "Booking",
    targetId: data.bookingId,
  });
  const tripAuthz = getAuthorizedWhereClause(ctx, { resource: "Trip", targetId: data.tripId });

  const booking = await prisma.booking.findFirst({
    where: bookingWhere,
    select: { id: true, equipmentId: true },
  });
  if (!booking) return { ok: false, error: "Booking not found" };

  const trip = await prisma.trip.findFirst({
    where: {
      AND: [tripAuthz, { bookingId: booking.id }],
    },
    select: { id: true, status: true },
  });
  if (!trip || trip.id !== data.tripId) return { ok: false, error: "Trip not found" };
  if (trip.status === "COMPLETED" || trip.status === "CANCELLED" || trip.status === "DISPUTED") {
    return { ok: false, error: "This trip can no longer be rescheduled." };
  }

  const availability = await checkEquipmentAvailabilityAction({
    equipmentId: booking.equipmentId,
    startLocal: data.startLocal,
    endLocal: data.endLocal,
    ignoreBookingId: booking.id,
    ignoreTripId: trip.id,
  });
  if (!availability.available) {
    return { ok: false, error: availability.error ?? "Machine is not available in this window" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          startDate: start,
          endDate: end,
          expectedShift: data.expectedShift?.trim() || null,
        },
      });
      await tx.trip.update({
        where: { id: trip.id },
        data: {
          scheduledDate: start,
          expectedEndTime: end,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update";
    return { ok: false, error: message };
  }

  return { ok: true };
}
