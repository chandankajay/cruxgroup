import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteSection } from "../../../../lib/content";
import { SITE_URL, WHATSAPP_ORDER_URL } from "../../../../lib/env";
import { parseLocale, type Locale } from "../../../../lib/locale";
import {
  MACHINE_SLIDES,
  type MachineSlide,
} from "../../../../components/sections/machine-sections-data";
import { Button } from "../../../../components/ui/Button";

export const revalidate = 3600;

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

const SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  jcb: {
    title: "JCB on Rent in Telangana | Crux Group",
    description:
      "Rent a JCB Backhoe Loader with trained operator across Telangana. Hourly & daily rates. Book online or via WhatsApp.",
    keywords: [
      "JCB rental Telangana",
      "JCB on hire Hyderabad",
      "JCB backhoe loader rent",
      "JCB rent near me",
      "earthmoving equipment Telangana",
    ],
  },
  posthole: {
    title: "Post Hole Digger on Rent in Telangana | Crux Group",
    description:
      "Hire a Post Hole Digger for fencing, solar farms, and foundations. Available across Telangana with trained operators.",
    keywords: [
      "post hole digger rental Telangana",
      "auger machine on hire Hyderabad",
      "fencing drilling machine rent",
      "post hole digger near me",
      "solar farm auger Telangana",
    ],
  },
  crane: {
    title: "Crane on Rent in Telangana | Crux Group",
    description:
      "Book 16–100 ton cranes for steel erection, heavy lifts, and infrastructure projects across Telangana.",
    keywords: [
      "crane rental Telangana",
      "crane on hire Hyderabad",
      "heavy crane rent",
      "mobile crane rental near me",
      "construction crane Telangana",
    ],
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
      b.heading_en?.toLowerCase().includes(slug === "posthole" ? "post" : slug),
  );
  if (!block) return null;

  return {
    slug,
    image: block.imageUrl ?? "",
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
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}/${locale}/equipment/${slug}`,
      siteName: "Crux Group",
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/equipment/${slug}`,
      languages: {
        en: `${SITE_URL}/en/equipment/${slug}`,
        te: `${SITE_URL}/te/equipment/${slug}`,
      },
    },
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

  const dbData = await getEquipmentFromDB(slug);
  const slide = getSlideData(slug);
  const data = dbData ?? (slide ? slideToEquipmentData(slide) : null);

  if (!data) notFound();

  const title = data.title(locale);
  const description = data.description(locale);
  const specs = data.specs(locale);
  const cta = data.cta(locale);
  const coverageLabel =
    locale === "te"
      ? "తెలంగాణ అంతటా అందుబాటులో"
      : "Available across Telangana";

  const useCases: Record<string, { en: string[]; te: string[] }> = {
    jcb: {
      en: [
        "Foundation digging & trenching",
        "Site leveling & grading",
        "Loading & material handling",
        "Road construction & drainage",
      ],
      te: [
        "పునాది తవ్వకం & ట్రెంచింగ్",
        "సైట్ లెవలింగ్ & గ్రేడింగ్",
        "లోడింగ్ & మెటీరియల్ హ్యాండ్లింగ్",
        "రోడ్ నిర్మాణం & డ్రెయినేజ్",
      ],
    },
    posthole: {
      en: [
        "Farm fencing & boundary marking",
        "Solar farm pole installation",
        "Foundation piling for buildings",
        "Plantation & tree planting holes",
      ],
      te: [
        "వ్యవసాయ ఫెన్సింగ్ & హద్దు గుర్తింపు",
        "సోలార్ ఫార్మ్ పోల్ ఇన్‌స్టాలేషన్",
        "భవనాల పునాది పైలింగ్",
        "మొక్కల & చెట్ల నాటడం గుంతలు",
      ],
    },
    crane: {
      en: [
        "Steel structure erection",
        "Heavy machinery installation",
        "Bridge & flyover construction",
        "Industrial plant maintenance",
      ],
      te: [
        "ఉక్కు నిర్మాణం",
        "భారీ యంత్రాల ఇన్‌స్టాలేషన్",
        "బ్రిడ్జ్ & ఫ్లైఓవర్ నిర్మాణం",
        "పారిశ్రామిక ప్లాంట్ నిర్వహణ",
      ],
    },
  };

  const currentUseCases = useCases[slug]?.[locale] ?? useCases[slug]?.en ?? [];

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

      {/* Hero */}
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
          <h1 className="text-3xl font-extrabold text-offwhite drop-shadow-lg md:text-5xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Description */}
      <section className="mt-10">
        <p className="text-lg leading-relaxed text-muted">{description}</p>
      </section>

      {/* Specs */}
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

      {/* Use cases */}
      {currentUseCases.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-offwhite">
            {locale === "te" ? "ఉపయోగాలు" : "Use Cases"}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {currentUseCases.map((uc) => (
              <li
                key={uc}
                className="flex items-start gap-2 text-muted"
              >
                <span className="mt-1 text-brand">✓</span>
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Coverage */}
      <section className="mt-12 rounded-xl border border-border bg-surface/30 p-6">
        <h2 className="text-lg font-bold text-offwhite">
          {locale === "te" ? "సేవా ప్రాంతం" : "Coverage Area"}
        </h2>
        <p className="mt-2 text-muted">{coverageLabel}</p>
        <p className="mt-1 text-sm text-muted/70">
          {locale === "te"
            ? "హైదరాబాద్, రంగారెడ్డి, మేడ్చల్, సంగారెడ్డి, నల్గొండ, వరంగల్, కరీంనగర్ మరియు మరిన్ని జిల్లాలు"
            : "Hyderabad, Ranga Reddy, Medchal, Sangareddy, Nalgonda, Warangal, Karimnagar, and more districts"}
        </p>
      </section>

      {/* CTA */}
      <section className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Button
          href={WHATSAPP_ORDER_URL}
          external
          variant="primary"
          size="lg"
          className="min-h-12 w-full sm:w-auto"
        >
          {cta}
        </Button>
        <span className="text-sm text-muted">
          {locale === "te"
            ? "WhatsApp ద్వారా బుక్ చేయండి — 24/7 అందుబాటులో"
            : "Book via WhatsApp — available 24/7"}
        </span>
      </section>
    </article>
  );
}
