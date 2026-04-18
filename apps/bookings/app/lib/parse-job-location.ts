import type { Prisma } from "@prisma/client";

export function parseJobLocationCoords(
  jobLocation: Prisma.JsonValue
): { lat: number; lng: number } | null {
  if (jobLocation === null || jobLocation === undefined) return null;
  if (typeof jobLocation !== "object" || Array.isArray(jobLocation)) return null;
  const o = jobLocation as Record<string, unknown>;
  if (typeof o.lat === "number" && typeof o.lng === "number") {
    return { lat: o.lat, lng: o.lng };
  }
  if (o.type === "Point" && Array.isArray(o.coordinates)) {
    const c = o.coordinates as unknown[];
    const lng = Number(c[0]);
    const lat = Number(c[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}
