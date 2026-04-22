import { parseLatLngFromPartnerBaseLocation, Prisma } from "@repo/db";
import { calculateDistanceKm, type LatLng } from "@repo/lib";

export const OUT_OF_SERVICE_AREA_MESSAGE =
  "This job site is outside the partner’s service area. Please choose a site within range or a different machine.";

type PartnerForGeo = {
  id: string;
  baseLocation: string | null;
  baseCoordinates: Prisma.JsonValue | null;
  maxRadius: number;
  maxServiceRadiusKm: number | null;
};

/**
 * Resolves the partner’s service centroid: `baseCoordinates` JSON first, else parsed `baseLocation` text.
 */
export function getPartnerServiceBase(p: PartnerForGeo): LatLng | null {
  if (p.baseCoordinates != null && typeof p.baseCoordinates === "object" && !Array.isArray(p.baseCoordinates)) {
    const o = p.baseCoordinates as Record<string, unknown>;
    const lat = o.lat;
    const lng = o.lng;
    if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }
  }
  const fromText = parseLatLngFromPartnerBaseLocation(p.baseLocation);
  return fromText;
}

export function getPartnerServiceRadiusKm(p: PartnerForGeo): number {
  return p.maxServiceRadiusKm ?? p.maxRadius;
}

export function isJobSiteWithinPartnerServiceArea(
  partner: PartnerForGeo,
  job: LatLng
): { ok: true; distanceKm: number } | { ok: false; distanceKm: number; reason: string } {
  const base = getPartnerServiceBase(partner);
  const limitKm = getPartnerServiceRadiusKm(partner);
  if (!base) {
    return { ok: false, distanceKm: Number.POSITIVE_INFINITY, reason: "no_base" };
  }
  if (limitKm <= 0) {
    return { ok: false, distanceKm: Number.POSITIVE_INFINITY, reason: "no_radius" };
  }
  const distanceKm = calculateDistanceKm(base, job);
  if (distanceKm > limitKm) {
    return { ok: false, distanceKm, reason: "too_far" };
  }
  return { ok: true, distanceKm };
}
