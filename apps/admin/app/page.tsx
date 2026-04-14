"use client";

import { useLabels } from "@repo/ui/dictionary-provider";

export default function Page() {
  const t = useLabels();

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">
        {t("HOME_WELCOME")}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {t("HOME_SUBTITLE")}
      </p>
    </div>
  );
}
