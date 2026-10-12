import type { Locale } from "../../locale";
import type { ServicePageSlug } from "../service-slugs";
import { SITE_SERVICES_CATALOG } from "./services-catalog-data";
import type { ServiceFaq, SiteService } from "./service-types";

export type { ServiceFaq, SiteService };

/** Legacy slugs → canonical catalog slug (CWA-25). */
const SLUG_ALIASES: Record<string, ServicePageSlug> = {
  "ground-levelling": "land-levelling",
  "compound-fence": "compound-fencing",
  "debris-clearing": "debris-rock-breaking",
  "silent-rock-breaking": "debris-rock-breaking",
};

export const SITE_SERVICES: readonly SiteService[] = SITE_SERVICES_CATALOG;

export function resolveServicePageSlug(slug: string): ServicePageSlug | undefined {
  const normalized = SLUG_ALIASES[slug] ?? slug;
  if (SITE_SERVICES.some((s) => s.slug === normalized)) {
    return normalized as ServicePageSlug;
  }
  return undefined;
}

export function getServiceBySlug(slug: string): SiteService | undefined {
  const canonical = SLUG_ALIASES[slug] ?? slug;
  return SITE_SERVICES.find((s) => s.slug === canonical);
}

export function getAllServiceSlugs(): ServicePageSlug[] {
  return SITE_SERVICES.map((s) => s.slug);
}

export function getServiceTitle(service: SiteService, locale: Locale): string {
  return locale === "te" ? service.title_te : service.title_en;
}

export function getServiceBody(service: SiteService, locale: Locale): string {
  return locale === "te" ? service.body_te : service.body_en;
}

export function getServiceSpecs(service: SiteService, locale: Locale): string[] {
  return [...(locale === "te" ? service.specs_te : service.specs_en)];
}

export function getServiceProcess(service: SiteService, locale: Locale): string[] {
  return [...(locale === "te" ? service.process_te : service.process_en)];
}

export function getServiceUnitLabel(service: SiteService, locale: Locale): string {
  return locale === "te" ? service.unitLabel_te : service.unitLabel_en;
}

export function getServiceFaqs(service: SiteService, locale: Locale): {
  question: string;
  answer: string;
}[] {
  return service.faqs.map((f) => ({
    question: locale === "te" ? f.question_te : f.question_en,
    answer: locale === "te" ? f.answer_te : f.answer_en,
  }));
}
