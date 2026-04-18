"use client";

import { useLabels } from "@repo/ui/dictionary-provider";

export function DashboardHome() {
  const t = useLabels();

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-charcoal">{t("HOME_WELCOME")}</h1>
      <p className="mt-1 text-muted-foreground">{t("HOME_SUBTITLE")}</p>
    </div>
  );
}
