"use client";

import { useLabels } from "@repo/ui/dictionary-provider";

const TRANSPORT_FEE = 1500;

interface PriceSummaryProps {
  readonly priceType: "daily" | "hourly";
  readonly dailyRate: number;
  readonly hourlyRate: number;
  readonly duration: number;
}

export function PriceSummary({
  priceType,
  dailyRate,
  hourlyRate,
  duration,
}: PriceSummaryProps) {
  const t = useLabels();
  const unitRate = priceType === "hourly" ? hourlyRate : dailyRate;
  const unitLabel = priceType === "hourly" ? "Hours" : t("DRAWER_DAYS");
  const rateLabel = priceType === "hourly" ? "Hourly Rate" : t("DRAWER_DAILY_RATE");
  const subtotal = duration * unitRate;
  const total = subtotal + TRANSPORT_FEE;

  return (
    <div className="space-y-2 rounded-lg bg-orange-50 p-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{rateLabel}</span>
        <span className="font-bold text-amber-600">₹{unitRate.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{unitLabel}</span>
        <span>{duration}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t("DRAWER_TRANSPORT")}</span>
        <span className="font-bold text-amber-600">₹{TRANSPORT_FEE.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-2 font-semibold">
        <span>{t("DRAWER_TOTAL")}</span>
        <span className="font-bold text-amber-700">₹{total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
