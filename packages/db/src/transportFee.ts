/**
 * Transport fee constants and calculator.
 *
 * All fee outputs are in **paise** (1 INR = 100 paise).
 */

/** Minimum distance before any transport charge applies. */
export const FREE_ZONE_KM = 5;

/** Legacy export: rupees per km (for labels only). Prefer `TRANSPORT_FEE_PAISE_PER_KM`. */
export const TRANSPORT_FEE_PER_KM = {
  FLATBED: 50,
  DRIVE: 30,
} as const;

/** Rate per chargeable km in paise (distance beyond the free zone). */
export const TRANSPORT_FEE_PAISE_PER_KM = {
  FLATBED: 50 * 100,
  DRIVE: 30 * 100,
} as const;

export type TransportMode = keyof typeof TRANSPORT_FEE_PAISE_PER_KM;

export interface TransportFeeBreakdown {
  distanceKm: number;
  /** Distance beyond the free zone that is actually charged. */
  chargeableKm: number;
  /** Paise per km beyond free zone. */
  feePerKmPaise: number;
  /** Total transport fee in paise. */
  totalFeePaise: number;
  /** @deprecated Use totalFeePaise; kept as rupees for quick display (÷100 from paise). */
  totalFee: number;
  isFree: boolean;
  mode: TransportMode;
}

/**
 * Calculate transport fee using tiered distance pricing.
 *
 * - Distance < FREE_ZONE_KM (5 km): Transport is FREE.
 * - Distance >= FREE_ZONE_KM: fee = (distanceKm - FREE_ZONE_KM) * feePerKm (in paise).
 */
export function calculateTransportFee(
  distanceKm: number,
  mode: TransportMode = "FLATBED"
): TransportFeeBreakdown {
  const feePerKmPaise = TRANSPORT_FEE_PAISE_PER_KM[mode];
  const isFree = distanceKm < FREE_ZONE_KM;
  const chargeableKm = isFree ? 0 : distanceKm - FREE_ZONE_KM;
  const totalFeePaise = Math.round(chargeableKm * feePerKmPaise);

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    chargeableKm: Number(chargeableKm.toFixed(2)),
    feePerKmPaise,
    totalFeePaise,
    totalFee: totalFeePaise / 100,
    isFree,
    mode,
  };
}
