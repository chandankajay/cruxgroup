import { calculateTransportFee, prisma } from "@repo/db";
import { calculateDistanceKm } from "@repo/lib";
import {
  getPartnerServiceBase,
  isJobSiteWithinPartnerServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
} from "./partner-geo";

// Valid 24-hex-char ObjectId used as the dev/guest user until real auth is wired up.
const DEV_GUEST_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

interface CreateBookingInput {
  userId: string;
  equipmentId: string;
  address: string;
  pincode: string;
  lat: number;
  lng: number;
  pricingUnit: "daily" | "hourly";
  duration: number;
  startDate: Date;
  endDate: Date;
}

function calculateDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function isValidObjectId(value: string): boolean {
  return /^[0-9a-f]{24}$/i.test(value);
}

async function resolveUserId(rawUserId: string): Promise<string> {
  const resolvedId = isValidObjectId(rawUserId) ? rawUserId : DEV_GUEST_USER_ID;

  await prisma.user.upsert({
    where: { id: resolvedId },
    update: {},
    create: {
      id: resolvedId,
      name: "Dev Guest",
      phoneNumber: `guest-${resolvedId.slice(-6)}`,
      role: "USER",
    },
  });

  return resolvedId;
}

export async function createBooking(input: CreateBookingInput) {
  const startDate = input.startDate instanceof Date ? input.startDate : new Date(input.startDate);
  const endDate = input.endDate instanceof Date ? input.endDate : new Date(input.endDate);

  const [equipment, userId] = await Promise.all([
    prisma.equipment.findUnique({ where: { id: input.equipmentId } }),
    resolveUserId(input.userId),
  ]);

  if (!equipment) throw new Error("Equipment not found");

  const jobSite = { lat: input.lat, lng: input.lng };
  const jobSiteHasCoords = input.lat !== 0 || input.lng !== 0;

  const partnerForGeo = equipment.partnerId
    ? await prisma.partner.findUnique({
        where: { id: equipment.partnerId },
        select: {
          id: true,
          baseLocation: true,
          baseCoordinates: true,
          maxRadius: true,
          maxServiceRadiusKm: true,
        },
      })
    : null;

  if (partnerForGeo) {
    if (!jobSiteHasCoords) {
      throw new Error(OUT_OF_SERVICE_AREA_MESSAGE);
    }
    const within = isJobSiteWithinPartnerServiceArea(partnerForGeo, jobSite);
    if (!within.ok) {
      throw new Error(OUT_OF_SERVICE_AREA_MESSAGE);
    }
  }

  const partnerLatLng = partnerForGeo ? getPartnerServiceBase(partnerForGeo) : null;

  const distanceKm =
    partnerLatLng && jobSiteHasCoords
      ? calculateDistanceKm(
          { lat: partnerLatLng.lat, lng: partnerLatLng.lng },
          { lat: input.lat, lng: input.lng }
        )
      : 0;

  const transportFee = calculateTransportFee(distanceKm, "FLATBED");

  const dailyDays = calculateDays(startDate, endDate);
  const isHourly = input.pricingUnit === "hourly";
  const chargeableDuration = isHourly ? input.duration : dailyDays;
  const hourlyRatePaise =
    equipment.hourlyRate > 0 ? equipment.hourlyRate : equipment.pricing.hourly;
  const selectedRatePaise = isHourly ? hourlyRatePaise : equipment.pricing.daily;
  const equipmentSubtotalPaise = Math.round(chargeableDuration * selectedRatePaise);
  const totalPaise = equipmentSubtotalPaise + transportFee.totalFeePaise;

  return prisma.booking.create({
    data: {
      userId,
      equipmentId: input.equipmentId,
      status: "PENDING",
      startDate,
      endDate,
      siteCoordinates: { lat: input.lat, lng: input.lng },
      location: {
        address: input.address,
        pincode: input.pincode,
        coordinates: { lat: input.lat, lng: input.lng },
      },
      pricing: {
        total: totalPaise,
        duration: chargeableDuration,
        unit: input.pricingUnit,
      },
    },
  });
}

export async function listBookings() {
  return prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true, phoneNumber: true } },
      equipment: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listBookingsByPartner(partnerId: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      baseLocation: true,
      baseCoordinates: true,
      maxRadius: true,
      maxServiceRadiusKm: true,
    },
  });

  const rows = await prisma.booking.findMany({
    where: {
      equipment: { partnerId },
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      location: true,
      siteCoordinates: true,
      pricing: true,
      user: { select: { id: true, name: true, phoneNumber: true } },
      equipment: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!partner) {
    return [];
  }

  return rows.filter((b) => {
    if (b.status !== "PENDING") {
      return true;
    }
    const site = siteLatLngFromBooking(b);
    if (!site) {
      return false;
    }
    return isJobSiteWithinPartnerServiceArea(partner, site).ok;
  });
}

function siteLatLngFromBooking(b: {
  siteCoordinates: unknown;
  location: { coordinates: { lat: number; lng: number } };
}): { lat: number; lng: number } | null {
  if (b.siteCoordinates != null && typeof b.siteCoordinates === "object" && !Array.isArray(b.siteCoordinates)) {
    const o = b.siteCoordinates as Record<string, unknown>;
    if (typeof o.lat === "number" && typeof o.lng === "number") {
      return { lat: o.lat, lng: o.lng };
    }
  }
  const c = b.location?.coordinates;
  if (c && typeof c.lat === "number" && typeof c.lng === "number") {
    return { lat: c.lat, lng: c.lng };
  }
  return null;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  return prisma.booking.update({
    where: { id },
    data: { status },
  });
}
