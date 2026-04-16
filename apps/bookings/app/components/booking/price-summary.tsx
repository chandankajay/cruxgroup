"use client";

import { useLabels } from "@repo/ui/dictionary-provider";
import {
  calculateTransportFee,
  FREE_ZONE_KM,
} from "@repo/db/transport-fee";

interface PriceSummaryProps {
  readonly priceType: "daily" | "hourly";
  readonly dailyRate: number;
  readonly hourlyRate: number;
  readonly duration: number;
  /** Distance in km from nearest partner base to job site. null = unknown (fetching). */
  readonly distanceKm: number | null;
}

export function PriceSummary({
  priceType,
  dailyRate,
  hourlyRate,
  duration,
  distanceKm,
}: PriceSummaryProps) {
  const t = useLabels();
  const unitRate = priceType === "hourly" ? hourlyRate : dailyRate;
  const unitLabel = priceType === "hourly" ? "Hours" : t("DRAWER_DAYS");
  const rateLabel = priceType === "hourly" ? "Hourly Rate" : t("DRAWER_DAILY_RATE");
  const subtotal = duration * unitRate;

  const transport =
    distanceKm !== null ? calculateTransportFee(distanceKm, "FLATBED") : null;

  const total = subtotal + (transport?.totalFee ?? 0);

  return (
    <div className="space-y-2 rounded-lg bg-orange-50 p-4 text-sm">
      {/* Equipment rate */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">{rateLabel}</span>
        <span className="font-bold text-amber-600">
          ₹{unitRate.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Duration */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">{unitLabel}</span>
        <span>{duration}</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>₹{subtotal.toLocaleString("en-IN")}</span>
      </div>

      {/* Transport fee — detailed breakdown */}
      <div className="flex justify-between border-t border-amber-100 pt-2">
        <span className="text-muted-foreground">
          {t("DRAWER_TRANSPORT")}
          {transport && (
            <span className="ml-1 text-xs">
              ({transport.distanceKm} km
              {transport.isFree
                ? ` — free within ${FREE_ZONE_KM} km`
                : `, ₹${transport.feePerKm}/km × ${transport.chargeableKm} km`}
              )
            </span>
          )}
          {distanceKm === null && (
            <span className="ml-1 text-xs text-amber-500">calculating…</span>
          )}
        </span>

        {transport ? (
          transport.isFree ? (
            <span className="font-semibold text-green-600">Free</span>
          ) : (
            <span className="font-bold text-amber-600">
              ₹{transport.totalFee.toLocaleString("en-IN")}
            </span>
          )
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      {/* Grand total */}
      <div className="flex justify-between border-t border-border pt-2 font-semibold">
        <span>{t("DRAWER_TOTAL")}</span>
        <span className="font-bold text-amber-700">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
