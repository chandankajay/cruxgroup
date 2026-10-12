import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { WhatsAppCta } from "../../../components/seo/whatsapp-cta";
import { BOOKINGS_URL, SITE_URL } from "../../../lib/env";
import {
  getServiceBody,
  getServiceSpecs,
  getServiceTitle,
  SITE_SERVICES,
} from "../../../lib/seo/data/services";
import { buildAlternates, metaDescription, seoTitle } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const title = seoTitle("Site Services in Hyderabad & Telangana");
  const description = metaDescription(
    "Book compound fence installation, ground levelling, debris clearing, and silent rock breaking across Hyderabad and Telangana. Online booking or WhatsApp enquiry.",
  );

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Crux Group`,
      description,
      url: `${SITE_URL}/${locale}/services`,
      siteName: "Crux Group",
      type: "website",
    },
    alternates: buildAlternates(locale, "services"),
    robots: { index: true, follow: true },
  };
}

export default async function ServicesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const allSearchTerms = SITE_SERVICES.flatMap((s) => s.searchTerms);

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        href={`/${locale}`}
        className="text-sm font-medium text-brand hover:text-accent"
      >
        ← {locale === "te" ? "హోమ్‌కి తిరిగి" : "Back to Home"}
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-extrabold text-offwhite md:text-4xl">
          {locale === "te"
            ? "సైట్ సేవలు — Hyderabad & Telangana"
            : "Site Services — Hyderabad & Telangana"}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          {locale === "te"
            ? "Compound fencing, ground levelling, debris clearing, mariyu silent rock breaking — venture plots, industrial sites, layouts kosam verified crews. Online booking or WhatsApp enquiry."
            : "Compound fencing, ground levelling, debris clearing, and silent rock breaking for venture plots, industrial sites, and layouts — verified crews across Telangana. Book online or enquire on WhatsApp."}
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {SITE_SERVICES.map((service) => {
          const title = getServiceTitle(service, locale);
          const body = getServiceBody(service, locale);
          const specs = getServiceSpecs(service, locale);

          return (
            <Link
              key={service.slug}
              href={`/${locale}/services/${service.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface/40 p-6 transition-colors hover:border-brand/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {locale === "te" ? service.eyebrow_te : service.eyebrow_en}
              </p>
              <h2 className="mt-2 text-xl font-bold text-offwhite group-hover:text-brand">
                {title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                {body}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {specs.slice(0, 2).map((spec) => (
                  <li
                    key={spec}
                    className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
              <span className="mt-4 text-sm font-medium text-brand group-hover:text-accent">
                {locale === "te" ? "వివరాలు చూడండి →" : "View details →"}
              </span>
            </Link>
          );
        })}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-surface/30 p-6 text-center">
        <h2 className="text-lg font-bold text-offwhite">
          {locale === "te" ? "సేవ బుక్ చేయడానికి సిద్ధంగా ఉన్నారా?" : "Ready to book a service?"}
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            href={`${BOOKINGS_URL}/login`}
            external
            variant="primary"
            size="lg"
            className="min-h-12 w-full sm:w-auto"
          >
            {locale === "te" ? "ఇప్పుడే బుక్ చేయండి" : "Book Now"}
          </Button>
          <WhatsAppCta
            className="w-full sm:w-auto"
            message="Hi Crux Group, I need site services for my plot. Please share availability."
            label={
              locale === "te"
                ? "WhatsApp ద్వారా బుక్ చేయండి — 24/7 అందుబాటులో"
                : "Book via WhatsApp — available 24/7"
            }
          />
        </div>
      </section>

      <ul aria-hidden className="sr-only">
        {allSearchTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </article>
  );
}
