/**
 * Transport fee constants and calculator.
 *
 * Safe to import in both server and client components — no Prisma dependency.
 */

/** Minimum distance before any transport charge applies. */
export const FREE_ZONE_KM = 5;

/** Rate per chargeable km (distance beyond the free zone). */
export const TRANSPORT_FEE_PER_KM = {
  /** Flatbed / crane truck delivery — heavier haul. */
  FLATBED: 50,
  /** Self-propelled / drive-on-road equipment. */
  DRIVE: 30,
} as const;

export type TransportMode = keyof typeof TRANSPORT_FEE_PER_KM;

export interface TransportFeeBreakdown {
  distanceKm: number;
  /** Distance beyond the free zone that is actually charged. */
  chargeableKm: number;
  feePerKm: number;
  totalFee: number;
  isFree: boolean;
  mode: TransportMode;
}

/**
 * Calculate transport fee using tiered distance pricing.
 *
 * - Distance < FREE_ZONE_KM (5 km): Transport is FREE.
 * - Distance >= FREE_ZONE_KM: fee = (distanceKm - FREE_ZONE_KM) * feePerKm.
 */
export function calculateTransportFee(
  distanceKm: number,
  mode: TransportMode = "FLATBED"
): TransportFeeBreakdown {
  const feePerKm = TRANSPORT_FEE_PER_KM[mode];
  const isFree = distanceKm < FREE_ZONE_KM;
  const chargeableKm = isFree ? 0 : distanceKm - FREE_ZONE_KM;
  const totalFee = Math.round(chargeableKm * feePerKm);

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    chargeableKm: Number(chargeableKm.toFixed(2)),
    feePerKm,
    totalFee,
    isFree,
    mode,
  };
}
