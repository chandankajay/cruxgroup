import { NextResponse } from "next/server";
import {
  calculateDistance,
  parseLatLngFromPartnerBaseLocation,
  prisma,
} from "@repo/db";

type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

type PartnerRecord = {
  /** Partner row id (matches `Equipment.partnerId`) */
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "PARTNER";
  location: GeoPoint;
  maxServiceRadius: number;
  baseAddress: string | null;
};

type PartnerSearchResult = {
  id: string;
  name: string | null;
  phoneNumber: string | null;
  email: string | null;
  baseAddress: string | null;
  distanceKm: number;
  maxServiceRadiusKm: number | null;
  available: boolean;
  reason: string | null;
  tier: "TIER_1" | "TIER_2" | "TIER_3";
};

type TierConfig = {
  label: "TIER_1" | "TIER_2" | "TIER_3";
  radiusKm: number;
};

const TIERS: TierConfig[] = [
  { label: "TIER_1", radiusKm: 10 },
  { label: "TIER_2", radiusKm: 25 },
  { label: "TIER_3", radiusKm: 50 },
];

function parseNumber(input: string | null): number | null {
  if (!input) return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
}

function partnerBaseLatLng(p: {
  baseLocation: string | null;
  baseCoordinates: unknown;
}): { lat: number; lng: number } | null {
  if (p.baseCoordinates != null && typeof p.baseCoordinates === "object" && !Array.isArray(p.baseCoordinates)) {
    const o = p.baseCoordinates as { lat?: unknown; lng?: unknown };
    if (typeof o.lat === "number" && typeof o.lng === "number" && Number.isFinite(o.lat) && Number.isFinite(o.lng)) {
      if (Math.abs(o.lat) <= 90 && Math.abs(o.lng) <= 180) {
        return { lat: o.lat, lng: o.lng };
      }
    }
  }
  return parseLatLngFromPartnerBaseLocation(p.baseLocation);
}

/**
 * Partners with parseable `baseLocation` within `radiusKm` of (lat, lng).
 * Uses the `partners` collection (User no longer stores GeoJSON `location`).
 */
async function queryPartnersInRadius(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
    },
  });

  const out: PartnerRecord[] = [];
  for (const p of partners) {
    const xy = partnerBaseLatLng(p);
    if (!xy) continue;
    const distanceKm = calculateDistance({ lat, lng }, xy);
    if (distanceKm > radiusKm) continue;
    const limitKm = p.maxServiceRadiusKm ?? p.maxRadius;
    out.push({
      _id: p.id,
      role: "PARTNER",
      name: p.user.name,
      phone: p.user.phoneNumber ?? undefined,
      email: p.user.email ?? undefined,
      location: { type: "Point", coordinates: [xy.lng, xy.lat] },
      maxServiceRadius: limitKm,
      baseAddress: p.address,
    });
  }
  return out;
}

async function queryPartnersTier(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  return queryPartnersInRadius(lat, lng, radiusKm);
}

async function getEquipmentMinDurationMap(
  partnerIds: string[],
  equipmentId: string | null
): Promise<Map<string, number>> {
  if (partnerIds.length === 0) return new Map();

  const map = new Map<string, number>();
  const equipmentList = await prisma.equipment.findMany({
    where: {
      partnerId: { in: partnerIds },
      ...(equipmentId ? { id: equipmentId } : {}),
    },
    select: { partnerId: true, minDaysForExtendedRadius: true },
    take: 500,
  });

  for (const equipment of equipmentList) {
    const key = equipment.partnerId ?? "";
    if (!key) continue;
    const minDays = equipment.minDaysForExtendedRadius ?? 0;
    const current = map.get(key) ?? 0;
    map.set(key, Math.max(current, minDays));
  }
  return map;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseNumber(url.searchParams.get("lat"));
  const lng = parseNumber(url.searchParams.get("lng"));
  const equipmentId = url.searchParams.get("equipmentId");
  const bookingDurationDays =
    parseNumber(url.searchParams.get("bookingDurationDays")) ?? 1;

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: "lat and lng query params are required." },
      { status: 400 }
    );
  }

  const tier1 = await queryPartnersTier(lat, lng, TIERS[0].radiusKm);
  const uniqueById = new Map<string, { partner: PartnerRecord; tier: TierConfig["label"] }>();

  for (const partner of tier1) {
    uniqueById.set(partner._id, { partner, tier: TIERS[0].label });
  }

  if (tier1.length < 3) {
    const tier2 = await queryPartnersTier(lat, lng, TIERS[1].radiusKm);
    for (const partner of tier2) {
      const id = partner._id;
      if (!uniqueById.has(id)) {
        uniqueById.set(id, { partner, tier: TIERS[1].label });
      }
    }

    if (tier2.length === 0) {
      const tier3 = await queryPartnersTier(lat, lng, TIERS[2].radiusKm);
      for (const partner of tier3) {
        const id = partner._id;
        if (!uniqueById.has(id)) {
          uniqueById.set(id, { partner, tier: TIERS[2].label });
        }
      }
    }
  }

  const partnerIds = Array.from(uniqueById.keys());
  const equipmentMinDurationMap = await getEquipmentMinDurationMap(
    partnerIds,
    equipmentId
  );

  const results: PartnerSearchResult[] = [];

  for (const [id, payload] of uniqueById.entries()) {
    const { partner, tier } = payload;
    const coordinates = partner.location?.coordinates ?? [];
    if (coordinates.length !== 2) continue;

    const [partnerLng, partnerLat] = coordinates;
    const distanceKm = calculateDistance(
      { lat, lng },
      { lat: partnerLat, lng: partnerLng }
    );

    let available = true;
    let reason: string | null = null;

    if (distanceKm > partner.maxServiceRadius) {
      available = false;
      reason = "Outside partner max service radius";
    } else if (distanceKm > 20) {
      const minDays = equipmentMinDurationMap.get(id) ?? 0;
      if (bookingDurationDays < minDays) {
        available = false;
        reason = `Requires minimum ${minDays}-day booking for extended travel`;
      }
    }

    results.push({
      id,
      name: partner.name ?? null,
      phoneNumber: partner.phone ?? null,
      email: partner.email ?? null,
      baseAddress: partner.baseAddress ?? null,
      distanceKm: Number(distanceKm.toFixed(2)),
      maxServiceRadiusKm: partner.maxServiceRadius ?? null,
      available,
      reason,
      tier,
    });
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({
    input: { lat, lng, bookingDurationDays, equipmentId },
    count: results.length,
    results,
  });
}

