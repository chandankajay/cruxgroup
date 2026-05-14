"use client";

import type { ReactNode } from "react";
import { useLang } from "./LanguageProvider";

export function BillingText({
  en,
  te,
}: {
  readonly en: string;
  readonly te?: string | null;
}): ReactNode {
  const { lang } = useLang();
  if (lang === "te" && te && te.trim().length > 0) {
    return te;
  }
  return en;
}
