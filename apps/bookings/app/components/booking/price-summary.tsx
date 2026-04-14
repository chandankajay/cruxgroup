"use client";

import { useLabels } from "@repo/ui/dictionary-provider";

const TRANSPORT_FEE = 1500;

interface PriceSummaryProps {
  readonly dailyRate: number;
  readonly days: number;
}

export function PriceSummary({ dailyRate, days }: PriceSummaryProps) {
  const t = useLabels();
  const subtotal = days * dailyRate;
  const total = subtotal + TRANSPORT_FEE;

  return (
    <div className="space-y-2 rounded-lg bg-orange-50 p-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t("DRAWER_DAILY_RATE")}</span>
        <span className="font-bold text-brand-orange">₹{dailyRate.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t("DRAWER_DAYS")}</span>
        <span>{days}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t("DRAWER_TRANSPORT")}</span>
        <span className="font-bold text-brand-orange">₹{TRANSPORT_FEE.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-2 font-semibold">
        <span>{t("DRAWER_TOTAL")}</span>
        <span className="font-bold text-brand-orange">₹{total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
