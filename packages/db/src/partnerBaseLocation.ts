/**
 * Parse optional `Partner.baseLocation` free text (e.g. "17.4, 78.4" from map/onboarding).
 * Assumes the first value is latitude and the second is longitude, per India conventions.
 */
export function parseLatLngFromPartnerBaseLocation(
  s: string | null | undefined
): { lat: number; lng: number } | null {
  if (s == null || typeof s !== "string") return null;
  const t = s.trim();
  if (!t) return null;

  const byComma = t
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (byComma.length >= 2) {
    const a = Number(byComma[0]);
    const b = Number(byComma[1]);
    return toCoords(a, b);
  }

  const w = t.split(/\s+/).filter(Boolean);
  if (w.length >= 2) {
    return toCoords(Number(w[0]), Number(w[1]));
  }
  return null;
}

function toCoords(a: number, b: number): { lat: number; lng: number } | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    return { lat: a, lng: b };
  }
  if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
    return { lat: b, lng: a };
  }
  return null;
}
