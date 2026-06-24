import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../../components/ui/Button";
import { BOOKINGS_URL, SITE_URL, WHATSAPP_ORDER_URL } from "../../../../lib/env";
import {
  getAllServiceSlugs,
  getServiceBody,
  getServiceBySlug,
  getServiceSpecs,
  getServiceTitle,
} from "../../../../lib/seo/data/services";
import { getTechnicalGuideBySlug } from "../../../../lib/seo/data/technical-guides";
import { buildAlternates, metaDescription, seoTitle } from "../../../../lib/seo/metadata-helpers";
import { isServicePageSlug } from "../../../../lib/seo/service-slugs";
import { parseLocale } from "../../../../lib/locale";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export const dynamicParams = true;

export function generateStaticParams(): { locale: string; slug: string }[] {
  const locales = ["en", "te"] as const;
  return locales.flatMap((locale) =>
    getAllServiceSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const service = getServiceBySlug(slug);

  if (!service) return { title: "Service | Crux Group" };

  return {
    title: seoTitle(service.seoTitle.replace(/ — Crux Group$/, "")),
    description: metaDescription(service.seoDescription),
    keywords: [...service.searchTerms],
    openGraph: {
      title: service.seoTitle,
      description: metaDescription(service.seoDescription),
      url: `${SITE_URL}/${locale}/services/${slug}`,
      siteName: "Crux Group",
      type: "website",
    },
    alternates: buildAlternates(locale, `services/${slug}`),
    robots: { index: true, follow: true },
  };
}

function whatsappHref(message: string): string {
  return `${WHATSAPP_ORDER_URL}?text=${encodeURIComponent(message)}`;
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);

  if (!isServicePageSlug(slug)) {
    notFound();
  }

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const title = getServiceTitle(service, locale);
  const description = getServiceBody(service, locale);
  const specs = getServiceSpecs(service, locale);
  const relatedGuides = service.relatedGuideSlugs
    .map((guideSlug) => getTechnicalGuideBySlug(guideSlug))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description,
    image: service.image.startsWith("http")
      ? service.image
      : `${SITE_URL}${service.image}`,
    provider: {
      "@type": "Organization",
      name: "Crux Agri & Rural Services LLP",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "State",
      name: "Telangana, India",
    },
    offers: {
      "@type": "Offer",
      url: `${BOOKINGS_URL}/login`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href={`/${locale}`} className="font-medium text-brand hover:text-accent">
          {locale === "te" ? "హోమ్" : "Home"}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/${locale}/services`}
          className="font-medium text-brand hover:text-accent"
        >
          {locale === "te" ? "సేవలు" : "Services"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-offwhite/80">{title}</span>
      </nav>

      <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-2xl">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            {locale === "te" ? service.eyebrow_te : service.eyebrow_en}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-offwhite drop-shadow-lg md:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      <section className="mt-10">
        <p className="text-lg leading-relaxed text-muted">{description}</p>
      </section>

      {specs.length > 0 ? (
        <section className="mt-8">
          <ul className="flex flex-wrap gap-3">
            {specs.map((spec) => (
              <li
                key={spec}
                className="rounded-full border border-brand/80 bg-surface/40 px-4 py-2 text-sm font-medium text-offwhite/90"
              >
                {spec}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-lg font-bold text-offwhite">
          {locale === "te" ? "సేవా ప్రాంతం" : "Coverage Area"}
        </h2>
        <p className="mt-2 text-muted">
          {locale === "te"
            ? "Hyderabad prime locations, ORR corridor, mariyu Telangana districts motham"
            : "Hyderabad prime locations, ORR corridor, and districts across Telangana"}
        </p>
      </section>

      {relatedGuides.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-offwhite">
            {locale === "te" ? "సంబంధిత గైడ్‌లు" : "Related Technical Guides"}
          </h2>
          <ul className="mt-4 space-y-3">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/${locale}/articles/${guide.slug}`}
                  className="block rounded-xl border border-border bg-surface/30 p-4 transition-colors hover:border-brand/40"
                >
                  <h3 className="font-semibold text-offwhite">{guide.title}</h3>
                  <p className="mt-1 text-sm text-muted">{guide.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-lg font-bold text-offwhite">
          {locale === "te" ? "ఇప్పుడే బుక్ చేయండి" : "Book This Service"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {locale === "te"
            ? "ఆన్‌లైన్ బుకింగ్ లేదా WhatsApp ద్వారా enquiry — 24/7 అందుబాటులో"
            : "Book online with live tracking or enquire on WhatsApp — available 24/7"}
        </p>
        <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <Button
            href={`${BOOKINGS_URL}/login`}
            external
            variant="primary"
            size="lg"
            className="min-h-12 w-full sm:w-auto"
          >
            {locale === "te" ? "ఇప్పుడే బుక్ చేయండి" : "Book Now"}
          </Button>
          <Button
            href={whatsappHref(service.whatsappMessage)}
            external
            variant="outline"
            size="lg"
            className="min-h-12 w-full border-green-600 text-green-500 hover:bg-green-600/10 sm:w-auto"
          >
            {locale === "te" ? "WhatsApp ద్వారా బుక్ చేయండి" : "Book via WhatsApp"}
          </Button>
        </div>
      </section>

      <ul aria-hidden className="sr-only">
        {service.searchTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </article>
  );
}
