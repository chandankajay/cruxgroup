import { calculateDistance } from "@repo/db";
import { calculateTransportFee, type TransportMode } from "@repo/db";

export interface CatalogGuards {
  /** Paise */
  minHourlyRate: number;
  maxHourlyRate: number;
  minDailyRate: number;
  maxDailyRate: number;
}

export function clampRate(rate: number, min: number, max: number): number {
  let r = rate;
  if (min > 0 && r < min) r = min;
  if (max > 0 && r > max) r = max;
  return r;
}

export interface WalkInQuoteInput {
  /** Paise per hour (from equipment) */
  hourlyBase: number;
  /** Paise per day (from equipment) */
  dailyBase: number;
  pricingUnit: "hourly" | "daily";
  duration: number;
  catalog: CatalogGuards | null;
  distanceKm: number;
  transportMode?: TransportMode;
}

export interface WalkInQuoteResult {
  unitRatePaise: number;
  equipmentSubtotalPaise: number;
  transportFeePaise: number;
  totalPaise: number;
  /** Derived rupees for UI labels only */
  unitRateRupees: number;
  equipmentSubtotalRupees: number;
  transportFeeRupees: number;
  totalRupees: number;
}

export function computeWalkInQuote(input: WalkInQuoteInput): WalkInQuoteResult {
  const mode = input.transportMode ?? "FLATBED";
  const hourlyRaw = input.hourlyBase;
  const dailyRaw = input.dailyBase;

  let hourly = hourlyRaw;
  let daily = dailyRaw;
  if (input.catalog) {
    hourly = clampRate(hourlyRaw, input.catalog.minHourlyRate, input.catalog.maxHourlyRate);
    daily = clampRate(dailyRaw, input.catalog.minDailyRate, input.catalog.maxDailyRate);
  }

  const equipmentSubtotalPaise =
    input.pricingUnit === "hourly"
      ? Math.round(hourly * input.duration)
      : Math.round(daily * input.duration);

  const transport = calculateTransportFee(input.distanceKm, mode);
  const totalPaise = equipmentSubtotalPaise + transport.totalFeePaise;

  const unitRatePaise = input.pricingUnit === "hourly" ? hourly : daily;

  return {
    unitRatePaise,
    equipmentSubtotalPaise,
    transportFeePaise: transport.totalFeePaise,
    totalPaise,
    unitRateRupees: unitRatePaise / 100,
    equipmentSubtotalRupees: equipmentSubtotalPaise / 100,
    transportFeeRupees: transport.totalFeePaise / 100,
    totalRupees: totalPaise / 100,
  };
}

export function partnerBaseCoords(
  baseLocation: string | null | undefined
): { lat: number; lng: number } | null {
  if (!baseLocation) return null;
  const parts = baseLocation.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export function distanceJobToPartnerKm(
  job: { lat: number; lng: number },
  partnerBase: { lat: number; lng: number } | null
): number {
  if (!partnerBase) return 0;
  return calculateDistance(
    { lat: partnerBase.lat, lng: partnerBase.lng },
    { lat: job.lat, lng: job.lng }
  );
}
