import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteSection } from "../../../../lib/content";
import { SITE_URL, BOOKINGS_URL } from "../../../../lib/env";
import { buildAlternates, metaDescription, seoTitle } from "../../../../lib/seo/metadata-helpers";
import { parseLocale, type Locale } from "../../../../lib/locale";
import {
  MACHINE_SLIDES,
  type MachineSlide,
} from "../../../../components/sections/machine-sections-data";
import { Button } from "../../../../components/ui/Button";
import { WhatsAppCta } from "../../../../components/seo/whatsapp-cta";
import { LOCATIONS } from "../../../../lib/seo/data/locations";
import {
  getUseCasesForEquipment,
  type UseCase,
} from "../../../../lib/seo/data/use-cases";
import { fleetHeadingToEquipmentSlug } from "../../../../lib/seo/equipment-slugs";

export const revalidate = 3600;

export const dynamicParams = true;

const EQUIPMENT_SLUGS = MACHINE_SLIDES.map((s) => s.id);

interface EquipmentData {
  slug: string;
  image: string;
  imageAlt: string;
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  specs: (locale: Locale) => string[];
  cta: (locale: Locale) => string;
}

const SEO: Record<string, { title: string; description: string }> = {
  jcb: {
    title: "JCB Backhoe on Rent in Hyderabad & Telangana — Crux Group",
    description:
      "Rent a JCB backhoe for site excavation, stone breaking, earthmoving, and site levelling across Hyderabad's ORR corridor and Telangana — trained operators, hourly and daily rates.",
  },
  posthole: {
    title: "Post Hole Digger for Rent in Hyderabad & Telangana — Crux Group",
    description:
      "Hire a post hole digger for hole digging, earthing rod pits, foundation holes, and auger work across Hyderabad and Telangana — fencing, solar, and telecom foundations with trained operators.",
  },
  crane: {
    title: "Crane on Rent in Telangana | Crux Group",
    description:
      "Book 16–100 ton cranes for steel erection, heavy lifts, and infrastructure projects across Telangana.",
  },
  borewell: {
    title: "Borewell Drilling in Hyderabad & Telangana — Crux Group Partner Network",
    description:
      "Borewell digging and water bore holes for residential plots, farms, and construction sites across Hyderabad and Telangana — fulfilled through our verified partner network.",
  },
};

function getSlideData(slug: string): MachineSlide | undefined {
  return MACHINE_SLIDES.find((s) => s.id === slug);
}

async function getEquipmentFromDB(
  slug: string,
): Promise<EquipmentData | null> {
  const section = await getSiteSection("fleet");
  if (!section) return null;

  const block = section.blocks.find(
    (b) =>
      b.type === "EQUIPMENT_CARD" &&
      fleetHeadingToEquipmentSlug(b.heading_en) === slug,
  );
  if (!block?.imageUrl) return null;

  return {
    slug,
    image: block.imageUrl,
    imageAlt: block.heading_en ?? slug,
    title: (locale) =>
      (locale === "te" ? block.heading_te : block.heading_en) ??
      block.heading_en ??
      slug,
    description: (locale) =>
      (locale === "te" ? block.body_te : block.body_en) ??
      block.body_en ??
      "",
    specs: () => [],
    cta: (locale) =>
      (locale === "te" ? block.cta_label_te : block.cta_label_en) ??
      block.cta_label_en ??
      "Book Now",
  };
}

function slideToEquipmentData(slide: MachineSlide): EquipmentData {
  return {
    slug: slide.id,
    image: slide.image,
    imageAlt: slide.imageAlt,
    title: (locale) => (locale === "te" ? slide.title_te : slide.title_en),
    description: (locale) =>
      locale === "te" ? slide.body_te : slide.body_en,
    specs: (locale) =>
      slide.specs.map((s) => (locale === "te" ? s.label_te : s.label_en)),
    cta: (locale) => (locale === "te" ? slide.cta_te : slide.cta_en),
  };
}

function topLocationsForEquipment(slug: string, useCases: UseCase[]) {
  const slugCounts = new Map<string, number>();
  for (const uc of useCases) {
    for (const loc of uc.locations) {
      slugCounts.set(loc, (slugCounts.get(loc) ?? 0) + 1);
    }
  }
  return [...slugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => LOCATIONS.find((l) => l.slug === s))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);
}

export function generateStaticParams(): { locale: string; slug: string }[] {
  const locales = ["en", "te"] as const;
  return locales.flatMap((locale) =>
    EQUIPMENT_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const seo = SEO[slug];

  if (!seo) return { title: "Equipment | Crux Group" };

  return {
    title: seoTitle(seo.title.replace(/ \| Crux Group$/, "")),
    description: metaDescription(seo.description),
    openGraph: {
      title: seo.title,
      description: metaDescription(seo.description),
      url: `${SITE_URL}/${locale}/equipment/${slug}`,
      siteName: "Crux Group",
      type: "website",
    },
    alternates: buildAlternates(locale, `equipment/${slug}`),
    robots: { index: true, follow: true },
  };
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);

  if (!EQUIPMENT_SLUGS.includes(slug as (typeof EQUIPMENT_SLUGS)[number])) {
    notFound();
  }

  const isBorewell = slug === "borewell";
  const slide = getSlideData(slug);
  const slideData = slide ? slideToEquipmentData(slide) : null;
  const dbData =
    !isBorewell && slideData ? await getEquipmentFromDB(slug) : null;
  const data = slideData ?? dbData;

  if (!data) notFound();

  const title = data.title(locale);
  const description = data.description(locale);
  const specs = data.specs(locale);
  const cta = data.cta(locale);
  const useCases = getUseCasesForEquipment(slug);
  const topLocations = topLocationsForEquipment(slug, useCases);

  const coverageLabel =
    locale === "te"
      ? "తెలంగాణ అంతటా అందుబాటులో"
      : "Available across Telangana";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${title} Rental`,
    description,
    image: data.image.startsWith("http")
      ? data.image
      : `${SITE_URL}${data.image}`,
    brand: { "@type": "Brand", name: "Crux Agri & Rural Services" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      areaServed: "Telangana, India",
    },
  };

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}`}
        className="text-sm font-medium text-brand hover:text-accent"
      >
        ← {locale === "te" ? "హోమ్‌కి తిరిగి" : "Back to Home"}
      </Link>

      <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-2xl">
        <Image
          src={data.image}
          alt={data.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-offwhite drop-shadow-lg md:text-5xl">
              {title}
            </h1>
            {isBorewell ? (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-300">
                Partner Network
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <p className="text-lg leading-relaxed text-muted">{description}</p>
      </section>

      {isBorewell ? (
        <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="text-lg font-bold text-amber-300">
            {locale === "te" ? "పార్ట్నర్ నెట్‌వర్క్" : "Partner Network Service"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Borewell drilling is fulfilled through our verified partner network.
            Availability subject to location and depth requirements. WhatsApp us
            for a quote — there is no self-serve booking for borewell rigs.
          </p>
        </section>
      ) : null}

      {specs.length > 0 && (
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
      )}

      {useCases.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-offwhite">
            {locale === "te" ? "Common jobs we handle" : "Common jobs we handle"}
          </h2>
          <ul className="mt-4 space-y-4">
            {useCases.map((uc) => (
              <li
                key={uc.slug}
                className="rounded-xl border border-border bg-surface/30 p-4"
              >
                <h3 className="font-semibold text-offwhite">
                  {locale === "te" ? uc.displayName_te : uc.displayName}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {locale === "te" && uc.description_te
                    ? uc.description_te.split(".")[0]
                    : uc.description.split(".")[0]}
                  .
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {uc.locations.slice(0, 3).map((locSlug) => {
                    const loc = LOCATIONS.find((l) => l.slug === locSlug);
                    if (!loc) return null;
                    return (
                      <Link
                        key={locSlug}
                        href={`/${locale}/${locSlug}`}
                        className="text-xs text-brand hover:text-accent"
                      >
                        {loc.displayName}
                      </Link>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topLocations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-offwhite">
            {locale === "te" ? "Top service areas" : "Top service areas"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/${locale}/${loc.slug}`}
                className="rounded-xl border border-border bg-surface/30 p-4 transition-colors hover:border-brand/40"
              >
                <h3 className="font-semibold text-offwhite">{loc.displayName}</h3>
                <p className="mt-1 text-xs text-muted">
                  {loc.district} · {loc.distanceFromHyderabad}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-lg font-bold text-offwhite">
          {locale === "te" ? "సేవా ప్రాంతం" : "Coverage Area"}
        </h2>
        <p className="mt-2 text-muted">{coverageLabel}</p>
        <p className="mt-1 text-sm text-muted/70">
          {locale === "te"
            ? "Hyderabad prime locations, ORR corridor, mariyu Telangana districts motham"
            : "Hyderabad prime locations, ORR corridor, and districts across Telangana"}
        </p>
      </section>

      <section className="mt-12 flex flex-col items-center gap-4">
        {isBorewell ? (
          <WhatsAppCta
            className="w-full sm:w-auto"
            message="Hi, I need borewell drilling. Please share partner availability and rates."
          />
        ) : (
          <>
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href={BOOKINGS_URL}
                external
                variant="primary"
                size="lg"
                className="min-h-12 w-full sm:w-auto"
              >
                {cta}
              </Button>
              <WhatsAppCta
                className="w-full sm:w-auto"
                message={`Hi, I need ${title}. Please share availability and rates.`}
              />
            </div>
            <span className="text-sm text-muted">
              {locale === "te"
                ? "ఆన్‌లైన్‌లో బుక్ చేయండి — లైవ్ ట్రాకింగ్ మరియు GST ఇన్‌వాయిస్"
                : "Book online with live tracking and GST invoice"}
            </span>
          </>
        )}
      </section>
    </article>
  );
}
