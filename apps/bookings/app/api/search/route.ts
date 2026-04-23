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
  companyName: string;
  role: "PARTNER";
  location: GeoPoint;
  maxServiceRadius: number;
  baseAddress: string | null;
};

/** B2C-safe payload: no partner PII, no stable ids for enumeration. */
type PartnerSearchResult = {
  distanceKm: number;
};

type TierConfig = {
  label: "TIER_1" | "TIER_2" | "TIER_3";
  radiusKm: number;
};

const TIERS = [
  { label: "TIER_1" as const, radiusKm: 10 },
  { label: "TIER_2" as const, radiusKm: 25 },
  { label: "TIER_3" as const, radiusKm: 50 },
] as const satisfies readonly TierConfig[];

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
 * KYC-verified, active partners with parseable base within `radiusKm` of (lat, lng).
 * Excludes unverified / ghost / pending partners from public search.
 */
async function queryPartnersInRadius(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<PartnerRecord[]> {
  const partners = await prisma.partner.findMany({
    where: {
      isActive: true,
      kycStatus: "VERIFIED",
    },
    select: {
      id: true,
      companyName: true,
      address: true,
      baseLocation: true,
      baseCoordinates: true,
      maxServiceRadiusKm: true,
      maxRadius: true,
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
      companyName: p.companyName,
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseNumber(url.searchParams.get("lat"));
  const lng = parseNumber(url.searchParams.get("lng"));
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

  type InternalResult = PartnerSearchResult & { _sortDistance: number };
  const internal: InternalResult[] = [];

  for (const [, payload] of uniqueById.entries()) {
    const { partner } = payload;
    const coordinates = partner.location?.coordinates ?? [];
    if (coordinates.length !== 2) continue;

    const [partnerLng, partnerLat] = coordinates;
    const distanceKm = calculateDistance(
      { lat, lng },
      { lat: partnerLat, lng: partnerLng }
    );

    internal.push({
      _sortDistance: distanceKm,
      distanceKm: Number(distanceKm.toFixed(2)),
    });
  }

  internal.sort((a, b) => a._sortDistance - b._sortDistance);

  const nearest = internal[0];
  const results: PartnerSearchResult[] =
    nearest !== undefined ? [{ distanceKm: nearest.distanceKm }] : [];

  return NextResponse.json({
    results,
  });
}
