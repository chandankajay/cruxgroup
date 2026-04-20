export type WalkInPrefill = {
  customerId?: string;
  equipmentId?: string;
  siteAddress?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  pricingUnit?: "hourly" | "daily";
  duration?: number;
  expectedShift?: string;
};

function firstString(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export function parseWalkInPrefill(
  sp: Record<string, string | string[] | undefined>
): WalkInPrefill | undefined {
  const customerId = firstString(sp, "customerId");
  const equipmentId = firstString(sp, "equipmentId");
  if (!customerId && !equipmentId) return undefined;

  const latRaw = firstString(sp, "lat");
  const lngRaw = firstString(sp, "lng");
  const durationRaw = firstString(sp, "duration");
  const unitRaw = firstString(sp, "pricingUnit");

  const lat = latRaw !== undefined ? Number(latRaw) : undefined;
  const lng = lngRaw !== undefined ? Number(lngRaw) : undefined;
  const duration = durationRaw !== undefined ? Number(durationRaw) : undefined;

  let pricingUnit: "hourly" | "daily" | undefined;
  if (unitRaw === "daily" || unitRaw === "hourly") {
    pricingUnit = unitRaw;
  }

  return {
    customerId,
    equipmentId,
    siteAddress: firstString(sp, "siteAddress"),
    pincode: firstString(sp, "pincode"),
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    pricingUnit,
    duration: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    expectedShift: firstString(sp, "expectedShift"),
  };
}
