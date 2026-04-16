import { prisma, calculateDistance, calculateTransportFee } from "@repo/db";

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

  // Look up partner base location for distance-based transport fee.
  const partner = equipment.partnerId
    ? await prisma.user.findUnique({
        where: { id: equipment.partnerId },
        select: { location: true },
      })
    : null;

  const partnerCoords = partner?.location?.coordinates;
  const jobSiteHasCoords = input.lat !== 0 || input.lng !== 0;

  const distanceKm =
    partnerCoords && partnerCoords.length === 2 && jobSiteHasCoords
      ? calculateDistance(
          { lat: input.lat, lng: input.lng },
          { lat: partnerCoords[1], lng: partnerCoords[0] }
        )
      : 0;

  const transportFee = calculateTransportFee(distanceKm, "FLATBED");

  const dailyDays = calculateDays(startDate, endDate);
  const isHourly = input.pricingUnit === "hourly";
  const chargeableDuration = isHourly ? input.duration : dailyDays;
  const hourlyRate = equipment.hourlyRate > 0 ? equipment.hourlyRate : equipment.pricing.hourly;
  const selectedRate = isHourly ? hourlyRate : equipment.pricing.daily;
  const total = chargeableDuration * selectedRate + transportFee.totalFee;

  return prisma.booking.create({
    data: {
      userId,
      equipmentId: input.equipmentId,
      status: "PENDING",
      startDate,
      endDate,
      location: {
        address: input.address,
        pincode: input.pincode,
        coordinates: { lat: input.lat, lng: input.lng },
      },
      pricing: { total, duration: chargeableDuration, unit: input.pricingUnit },
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

export async function updateBookingStatus(id: string, status: BookingStatus) {
  return prisma.booking.update({
    where: { id },
    data: { status },
  });
}
