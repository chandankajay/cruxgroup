import { prisma, parseLatLngFromPartnerBaseLocation } from "@repo/db";
import type { Prisma } from "@repo/db";
import { calculateDistanceKm } from "./geo";
import { sendWhatsAppMessage } from "./aisensy";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EligiblePartner {
  partnerId: string;
  partnerPhone: string;
  partnerName: string;
}

export interface BookingNotificationDetails {
  equipmentName: string;
  equipmentCategory: string;
  customerName: string;
  locationAddress: string;
  startDate: Date;
  durationDays?: number;
  durationHours?: number;
}

export interface NotifyResult {
  notified: number;
  errors: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPartnerBaseLatLng(
  baseCoordinates: Prisma.JsonValue | null,
  baseLocation: string | null,
): { lat: number; lng: number } | null {
  if (
    baseCoordinates != null &&
    typeof baseCoordinates === "object" &&
    !Array.isArray(baseCoordinates)
  ) {
    const o = baseCoordinates as Record<string, unknown>;
    if (
      typeof o.lat === "number" &&
      typeof o.lng === "number" &&
      Number.isFinite(o.lat) &&
      Number.isFinite(o.lng)
    ) {
      return { lat: o.lat, lng: o.lng };
    }
  }
  return parseLatLngFromPartnerBaseLocation(baseLocation);
}

function getServiceRadiusKm(
  maxServiceRadiusKm: number | null,
  maxRadius: number,
): number {
  return maxServiceRadiusKm ?? maxRadius;
}

// ─── Function 1: findEligiblePartners ───────────────────────────────────────

export async function findEligiblePartners(
  bookingLat: number,
  bookingLng: number,
  _equipmentCategory?: string,
): Promise<EligiblePartner[]> {
  const partners = await prisma.partner.findMany({
    where: {
      kycStatus: "VERIFIED",
      isActive: true,
      baseCoordinates: { not: null },
    },
    select: {
      id: true,
      baseLocation: true,
      baseCoordinates: true,
      maxRadius: true,
      maxServiceRadiusKm: true,
      user: { select: { name: true, phoneNumber: true } },
    },
  });

  const eligible: EligiblePartner[] = [];

  for (const p of partners) {
    const base = getPartnerBaseLatLng(p.baseCoordinates, p.baseLocation);
    if (!base) continue;

    const radiusKm = getServiceRadiusKm(p.maxServiceRadiusKm, p.maxRadius);
    if (radiusKm <= 0) continue;

    const distKm = calculateDistanceKm(base, { lat: bookingLat, lng: bookingLng });
    if (distKm <= radiusKm && p.user.phoneNumber) {
      eligible.push({
        partnerId: p.id,
        partnerPhone: p.user.phoneNumber,
        partnerName: p.user.name || "Partner",
      });
    }
  }

  return eligible;
}

// ─── Function 2: createBookingResponseTokens ────────────────────────────────

export async function createBookingResponseTokens(
  bookingId: string,
  partnerIds: string[],
): Promise<Array<{ partnerId: string; token: string }>> {
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const tokens: Array<{ partnerId: string; token: string }> = [];

  for (const partnerId of partnerIds) {
    const record = await prisma.bookingResponseToken.create({
      data: {
        bookingId,
        partnerId,
        expiresAt,
      },
    });
    tokens.push({ partnerId, token: record.token });
  }

  return tokens;
}

// ─── Function 3: sendPartnerBookingNotification ─────────────────────────────

export async function sendPartnerBookingNotification(params: {
  partnerPhone: string;
  partnerName: string;
  token: string;
  booking: {
    equipmentName: string;
    customerName: string;
    locationAddress: string;
    startDate: string;
    duration: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  const campaignName = process.env["AISENSY_BOOKING_NOTIFICATION"];
  if (!campaignName) {
    console.log("[partner-notification] AISENSY_BOOKING_NOTIFICATION not set, skipping");
    return { success: true };
  }

  const ok = await sendWhatsAppMessage(
    params.partnerPhone,
    campaignName,
    [
      params.booking.equipmentName,
      params.booking.customerName,
      params.booking.locationAddress,
      params.booking.startDate,
      params.booking.duration,
      params.token,
    ],
  );

  if (ok) {
    await prisma.bookingResponseToken.update({
      where: { token: params.token },
      data: { notifiedAt: new Date() },
    });
    return { success: true };
  }

  return { success: false, error: "WhatsApp send failed" };
}

// ─── Function 4: notifyPartnersForBooking (orchestrator) ────────────────────

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function notifyPartnersForBooking(
  bookingId: string,
  bookingLat: number,
  bookingLng: number,
  bookingDetails: BookingNotificationDetails,
): Promise<NotifyResult> {
  const partners = await findEligiblePartners(
    bookingLat,
    bookingLng,
    bookingDetails.equipmentCategory,
  );

  if (partners.length === 0) {
    console.warn("[partner-notification] No eligible partners found for booking", bookingId);
    return { notified: 0, errors: ["No eligible partners found"] };
  }

  const tokens = await createBookingResponseTokens(
    bookingId,
    partners.map((p) => p.partnerId),
  );

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PENDING_PARTNER" },
  });

  const tokenMap = new Map(tokens.map((t) => [t.partnerId, t.token]));
  const formattedDate = dateFormatter.format(bookingDetails.startDate);
  const duration = bookingDetails.durationDays
    ? `${bookingDetails.durationDays} day${bookingDetails.durationDays > 1 ? "s" : ""}`
    : `${bookingDetails.durationHours ?? 1} hours`;

  let successCount = 0;
  const errors: string[] = [];

  for (const partner of partners) {
    const token = tokenMap.get(partner.partnerId);
    if (!token) continue;

    const result = await sendPartnerBookingNotification({
      partnerPhone: partner.partnerPhone,
      partnerName: partner.partnerName,
      token,
      booking: {
        equipmentName: bookingDetails.equipmentName,
        customerName: bookingDetails.customerName,
        locationAddress: bookingDetails.locationAddress,
        startDate: formattedDate,
        duration,
      },
    });

    if (result.success) {
      successCount++;
    } else {
      errors.push(`Failed for ${partner.partnerName}: ${result.error}`);
    }
  }

  console.log(
    `[partner-notification] notified ${successCount}/${partners.length} partners for booking ${bookingId}`,
  );

  return { notified: successCount, errors };
}
