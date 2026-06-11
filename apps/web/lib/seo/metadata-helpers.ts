import type { Metadata } from "next";
import { SITE_URL } from "../env";
import type { Locale } from "../locale";

const TITLE_SUFFIX = " | Crux Group";
const TITLE_MAX = 60;

/** Self-referencing canonical + hreflang alternates for a locale-scoped path. */
export function buildAlternates(
  locale: Locale | string,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const canonical = clean
    ? `${SITE_URL}/${locale}/${clean}`
    : `${SITE_URL}/${locale}`;

  return {
    canonical,
    languages: {
      en: clean ? `${SITE_URL}/en/${clean}` : `${SITE_URL}/en`,
      te: clean ? `${SITE_URL}/te/${clean}` : `${SITE_URL}/te`,
    },
  };
}

/** Keep rendered `<title>` under ~60 characters including the layout template suffix. */
export function seoTitle(primary: string): string {
  const maxPrimary = TITLE_MAX - TITLE_SUFFIX.length;
  const trimmed = primary.trim();
  if (trimmed.length <= maxPrimary) return trimmed;
  return `${trimmed.slice(0, maxPrimary - 1).trimEnd()}…`;
}

/** Trim meta descriptions to SEO-friendly length (default max 160). */
export function metaDescription(text: string, max = 160): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  const slice = normalized.slice(0, max - 1);
  const breakAt = slice.lastIndexOf(" ");
  const cut = breakAt > max - 40 ? slice.slice(0, breakAt) : slice;
  return `${cut.trimEnd()}…`;
}
