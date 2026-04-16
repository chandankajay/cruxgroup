import { NextResponse } from "next/server";
import { calculateDistance, prisma } from "@repo/db";

type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

type PartnerRecord = {
  _id: { $oid?: string } | string;
  name?: string;
  phone?: string;
  email?: string;
  role: "PARTNER";
  location?: GeoPoint;
  maxServiceRadius?: number | null;
  baseAddress?: string | null;
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

function asObjectIdString(value: { $oid?: string } | string): string {
  if (typeof value === "string") return value;
  return value.$oid ?? "";
}

function parseNumber(input: string | null): number | null {
  if (!input) return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
}

async function queryPartnersByNear(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  const maxDistanceMeters = radiusKm * 1000;
  const result = (await prisma.$runCommandRaw({
    find: "users",
    filter: {
      role: "PARTNER",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters,
        },
      },
    },
    projection: {
      _id: 1,
      name: 1,
      phone: 1,
      email: 1,
      baseAddress: 1,
      maxServiceRadius: 1,
      location: 1,
    },
    limit: 100,
  })) as {
    cursor?: { firstBatch?: PartnerRecord[] };
  };

  return result.cursor?.firstBatch ?? [];
}

async function queryPartnersByRadiusFallback(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      email: true,
      location: true,
      maxServiceRadius: true,
      baseAddress: true,
    },
  });

  return partners
    .filter((p) => p.location?.coordinates?.length === 2)
    .map(
      (p) =>
        ({
          _id: p.id,
          role: "PARTNER",
          name: p.name,
          phone: p.phoneNumber ?? undefined,
          email: p.email ?? undefined,
          location: p.location as GeoPoint,
          maxServiceRadius: p.maxServiceRadius ?? null,
          baseAddress: p.baseAddress ?? null,
        }) as PartnerRecord
    )
    .filter((p) => {
      if (!p.location) return false;
      const [partnerLng, partnerLat] = p.location.coordinates;
      const distanceKm = calculateDistance(
        { lat, lng },
        { lat: partnerLat, lng: partnerLng }
      );
      return distanceKm <= radiusKm;
    });
}

async function queryPartnersTier(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  try {
    return await queryPartnersByNear(lat, lng, radiusKm);
  } catch {
    // Fallback for environments where $runCommandRaw is unavailable.
    return queryPartnersByRadiusFallback(lat, lng, radiusKm);
  }
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
    uniqueById.set(asObjectIdString(partner._id), { partner, tier: TIERS[0].label });
  }

  if (tier1.length < 3) {
    const tier2 = await queryPartnersTier(lat, lng, TIERS[1].radiusKm);
    for (const partner of tier2) {
      const id = asObjectIdString(partner._id);
      if (!uniqueById.has(id)) {
        uniqueById.set(id, { partner, tier: TIERS[1].label });
      }
    }

    if (tier2.length === 0) {
      const tier3 = await queryPartnersTier(lat, lng, TIERS[2].radiusKm);
      for (const partner of tier3) {
        const id = asObjectIdString(partner._id);
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

    if (
      typeof partner.maxServiceRadius === "number" &&
      distanceKm > partner.maxServiceRadius
    ) {
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

