import "server-only";

import { randomUUID, randomInt } from "node:crypto";
import { prisma } from "@repo/db";
import {
  advanceBookingProgress,
  createBookingResponseTokens,
  sendBookingConfirmationWhatsApp,
  sendOperatorMagicLink,
  sendPartnerBookingNotification,
} from "@repo/lib";
import { normalizeAdminPhone } from "../../../../../lib/phone";
import { naiveIstLocalToUtc } from "./ist-datetime";
import {
  computeWalkInQuote,
  distanceJobToPartnerKm,
  partnerBaseCoords,
  type CatalogGuards,
} from "./walk-in-pricing";
import type { WalkInBookingValues } from "../schema";
import { upsertWalkInCustomer } from "./walk-in-customer";

export type WalkInCoreOptions = {
  origin: "ONLINE" | "WALK_IN" | "ADMIN_WALK_IN" | "HISTORICAL";
  adminAssignMode?: "DIRECT" | "PARTNER_REQUEST";
  silent?: boolean;
  historical?: {
    actualStartLocal: string;
    actualEndLocal: string;
  };
  partnerId?: string;
};

export type WalkInCoreResult = {
  bookingId: string;
  tripId: string | null;
  notifyFailed?: boolean;
};

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

function istScheduleLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function sendWalkInDirectNotifications(params: {
  bookingId: string;
  equipment: { name: string; category: string; operatorPhone: string | null };
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  start: Date;
  quoteRupees: number;
  operatorLink: string;
  startOtp: string;
}): Promise<boolean> {
  let notifyFailed = false;

  void advanceBookingProgress(params.bookingId, "BOOKING_RECEIVED").catch(() => undefined);
  void advanceBookingProgress(params.bookingId, "BOOKING_CONFIRMED").catch(() => undefined);

  try {
    if (params.equipment.operatorPhone?.trim()) {
      const ok = await sendOperatorMagicLink({
        operatorPhone: params.equipment.operatorPhone,
        jobLabel: `${params.equipment.category} ${params.equipment.name}`.trim(),
        magicLinkUrl: params.operatorLink,
        startOtp: params.startOtp,
      });
      if (!ok) notifyFailed = true;
      else {
        void advanceBookingProgress(params.bookingId, "MACHINE_ASSIGNED").catch(() => undefined);
      }
    }

    const okCustomer = await sendBookingConfirmationWhatsApp({
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      equipmentName: params.equipment.name,
      siteAddress: params.siteAddress,
      scheduledIstLabel: istScheduleLabel(params.start),
      totalInrLabel: `₹${params.quoteRupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    });
    if (!okCustomer) notifyFailed = true;
  } catch {
    notifyFailed = true;
  }

  return notifyFailed;
}

export async function createWalkInBookingCore(
  data: WalkInBookingValues,
  options: WalkInCoreOptions,
): Promise<WalkInCoreResult> {
  let start: Date;
  let end: Date;
  try {
    if (options.historical) {
      start = naiveIstLocalToUtc(options.historical.actualStartLocal);
      end = naiveIstLocalToUtc(options.historical.actualEndLocal);
    } else {
      start = naiveIstLocalToUtc(data.startLocal);
      end = naiveIstLocalToUtc(data.endLocal);
    }
  } catch {
    throw new Error("Invalid date/time");
  }
  if (end.getTime() <= start.getTime()) {
    throw new Error("End must be after start");
  }

  const equipment = await prisma.equipment.findFirst({
    where: { id: data.equipmentId, isActive: true },
    include: {
      catalog: {
        select: {
          minHourlyRate: true,
          maxHourlyRate: true,
          minDailyRate: true,
          maxDailyRate: true,
        },
      },
      partner: {
        select: {
          id: true,
          companyName: true,
          contactPhone: true,
          baseLocation: true,
          gstNumber: true,
        },
      },
    },
  });

  if (!equipment?.partnerId || !equipment.partner) {
    throw new Error("Equipment must belong to a partner");
  }

  if (options.partnerId && equipment.partnerId !== options.partnerId) {
    throw new Error("Selected machine does not belong to the chosen partner");
  }

  const partnerId = equipment.partnerId;
  const hourlyBase =
    equipment.hourlyRate > 0 ? equipment.hourlyRate : equipment.pricing.hourly;
  const dailyBase = equipment.pricing.daily;
  const catalog: CatalogGuards | null = equipment.catalog
    ? {
        minHourlyRate: equipment.catalog.minHourlyRate,
        maxHourlyRate: equipment.catalog.maxHourlyRate,
        minDailyRate: equipment.catalog.minDailyRate,
        maxDailyRate: equipment.catalog.maxDailyRate,
      }
    : null;

  const base = partnerBaseCoords(equipment.partner.baseLocation);
  const distanceKm = distanceJobToPartnerKm({ lat: data.lat, lng: data.lng }, base);

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
    const c = await prisma.customer.findUnique({ where: { id: data.customerId! } });
    if (!c) throw new Error("Customer not found");
    customerId = c.id;
    customerName = c.name;
    customerPhone = c.phone;
  } else {
    const created = await upsertWalkInCustomer({
      name: data.newName!,
      phone: data.newPhone!,
      company: data.newCompany,
      gstin: data.newGstin,
    });
    customerId = created.id;
    customerName = created.name;
    customerPhone = created.phone;
  }

  const customerUserPhone = normalizeAdminPhone(customerPhone);
  const platformUser = await prisma.user.upsert({
    where: { phoneNumber: customerUserPhone },
    create: { phoneNumber: customerUserPhone, name: customerName, role: "USER" },
    update: { name: customerName },
    select: { id: true },
  });

  const startOtp = randomOtp4();
  const endOtp = randomOtp4();
  const jobLocation = { address: data.siteAddress, lat: data.lat, lng: data.lng };

  const isPartnerRequest = options.adminAssignMode === "PARTNER_REQUEST";
  const isHistorical = Boolean(options.historical);

  let bookingStatus: "PENDING" | "PENDING_PARTNER" | "CONFIRMED" | "COMPLETED";
  let tripStatus: "ENROUTE" | "COMPLETED" | null = null;
  if (isHistorical) {
    bookingStatus = "COMPLETED";
    tripStatus = "COMPLETED";
  } else if (isPartnerRequest) {
    bookingStatus = "PENDING_PARTNER";
    tripStatus = null;
  } else {
    bookingStatus = "CONFIRMED";
    tripStatus = "ENROUTE";
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        userId: platformUser.id,
        equipmentId: equipment.id,
        partnerId,
        customerId,
        status: bookingStatus,
        origin: options.origin,
        adminAssignMode: options.adminAssignMode ?? null,
        startDate: start,
        endDate: end,
        siteAddress: data.siteAddress,
        expectedShift: data.expectedShift?.trim() || null,
        quoteAmount: quote.totalPaise,
        progressStage: isHistorical ? "JOB_COMPLETED" : undefined,
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

    let trip: { id: string; operatorToken: string } | null = null;
    if (tripStatus) {
      trip = await tx.trip.create({
        data: {
          userId: platformUser.id,
          equipmentId: equipment.id,
          partnerId,
          bookingId: booking.id,
          scheduledDate: start,
          expectedEndTime: end,
          actualStartTime: isHistorical ? start : undefined,
          actualEndTime: isHistorical ? end : undefined,
          totalBilledHours: isHistorical
            ? Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))
            : undefined,
          totalAmount: quote.totalPaise,
          status: tripStatus,
          isHistorical: isHistorical,
          startOtp,
          endOtp,
          reviewToken: randomUUID(),
          lockedHourlyRate: quote.unitRatePaise,
          lockedTransportFee: quote.transportFeePaise,
          jobLocation,
          distanceKm,
        },
      });
    }

    return { booking, trip };
  });

  if (options.silent) {
    return { bookingId: result.booking.id, tripId: result.trip?.id ?? null };
  }

  if (isPartnerRequest) {
    const tokens = await createBookingResponseTokens(result.booking.id, [partnerId]);
    const token = tokens[0]?.token;
    if (!token) throw new Error("Failed to create partner response token");

    const durationLabel =
      data.pricingUnit === "daily"
        ? `${data.duration} day${data.duration > 1 ? "s" : ""}`
        : `${data.duration} hours`;

    const partnerPhone =
      equipment.partner.contactPhone?.trim() ||
      equipment.operatorPhone?.trim() ||
      "";

    const sent = await sendPartnerBookingNotification({
      partnerPhone,
      partnerName: equipment.partner.companyName || "Partner",
      token,
      booking: {
        equipmentName: equipment.name,
        customerName,
        locationAddress: data.siteAddress,
        startDate: istScheduleLabel(start),
        duration: durationLabel,
      },
    });

    return {
      bookingId: result.booking.id,
      tripId: null,
      ...(sent.success ? {} : { notifyFailed: true }),
    };
  }

  if (!result.trip) {
    return { bookingId: result.booking.id, tripId: null };
  }

  const origin = bookingsAppOrigin();
  const operatorLink = `${origin}/operator/${result.trip.operatorToken}`;
  const notifyFailed = await sendWalkInDirectNotifications({
    bookingId: result.booking.id,
    equipment,
    customerName,
    customerPhone,
    siteAddress: data.siteAddress,
    start,
    quoteRupees: quote.totalRupees,
    operatorLink,
    startOtp,
  });

  return {
    bookingId: result.booking.id,
    tripId: result.trip.id,
    ...(notifyFailed ? { notifyFailed: true } : {}),
  };
}

export async function finalizeWalkInAfterPartnerAccept(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      equipment: { include: { partner: true } },
      user: true,
    },
  });

  if (!booking?.partnerId || !booking.startDate || !booking.endDate) return;
  if (booking.origin !== "ADMIN_WALK_IN" && booking.origin !== "WALK_IN") return;
  if (booking.adminAssignMode !== "PARTNER_REQUEST") return;

  const existingTrip = await prisma.trip.findFirst({ where: { bookingId }, select: { id: true } });
  if (existingTrip) return;

  const startOtp = randomOtp4();
  const endOtp = randomOtp4();
  const jobLocation = {
    address: booking.siteAddress ?? booking.location.address,
    lat: booking.location.coordinates.lat,
    lng: booking.location.coordinates.lng,
  };

  const hourlyRate =
    booking.equipment.hourlyRate > 0
      ? booking.equipment.hourlyRate
      : booking.equipment.pricing.hourly;

  const trip = await prisma.trip.create({
    data: {
      userId: booking.userId,
      equipmentId: booking.equipmentId,
      partnerId: booking.partnerId,
      bookingId: booking.id,
      scheduledDate: booking.startDate,
      expectedEndTime: booking.endDate,
      status: "ENROUTE",
      startOtp,
      endOtp,
      reviewToken: randomUUID(),
      lockedHourlyRate: hourlyRate,
      lockedTransportFee: 0,
      totalAmount: booking.pricing.total,
      jobLocation,
      distanceKm: 0,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CONFIRMED" },
  });

  const customerPhone = booking.customer?.phone || booking.user.phoneNumber || "";
  const customerName = booking.customer?.name || booking.user.name || "Customer";
  const origin = bookingsAppOrigin();
  const operatorLink = `${origin}/operator/${trip.operatorToken}`;

  await sendWalkInDirectNotifications({
    bookingId: booking.id,
    equipment: booking.equipment,
    customerName,
    customerPhone,
    siteAddress: booking.siteAddress ?? booking.location.address,
    start: booking.startDate,
    quoteRupees: booking.pricing.total / 100,
    operatorLink,
    startOtp,
  });
}
