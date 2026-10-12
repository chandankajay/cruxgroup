import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "../../../components/seo/json-ld";
import { Button } from "../../../components/ui/Button";
import { BillingText } from "../../../components/ui/BillingText";
import { BOOKINGS_URL, SITE_URL } from "../../../lib/env";
import { buildAlternates, metaDescription } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";

export const revalidate = 86400;

const CONTENT = {
  eyebrow: {
    en: "Meet the Founder",
    te: "వ్యవస్థాపకుడిని కలవండి",
  },
  name: {
    en: "Crux Ajay",
    te: "Crux Ajay",
  },
  tagline: {
    en: "From code to construction yards — building India's most trusted equipment network.",
    te: "కోడ్ నుండి నిర్మాణ స్థలాల వరకు — భారతదేశంలో అత్యంత విశ్వసనీయమైన equipment నెట్‌వర్క్ ను నిర్మిస్తున్నారు.",
  },
  story: {
    en: [
      "For over 12 years, Crux Ajay has lived at the intersection of technology and real-world problem solving — designing and shipping applications with cutting-edge stacks, from cloud-native backends to mobile-first experiences that millions rely on.",
      "But the biggest product he ever built wasn't written in a IDE. It started on dusty construction sites across Telangana, where he watched fleet owners lose money on idle machines while contractors waited days to find a reliable JCB or crane.",
      "That gap — between infra demand and agri-rural supply — became an obsession. Crux Group is the answer: a fleet management platform that connects verified owners with customers who need equipment now, not next week.",
    ],
    te: [
      "12+ సంవత్సరాలుగా, Crux Ajay టెక్నాలజీ మరియు నిజ జీవిత సమస్యల పరిష్కారం మధ్య జీవించారు — క్లౌడ-నేటివ్ బ్యాకెండ్‌ల నుండి మొబైల్-ఫస్ట్ అనుభవాల వరకు, కోట్ల మంది విశ్వసించే అప్లికేషన్‌లను రూపొందించి, అమలు చేశారు.",
      "అయితే అతను నిర్మించిన అతిపెద్ద ఉత్పత్తి IDE లో రాయబడలేదు. ఇది తెలంగాణలోని దుమ్ము కమ్మిన నిర్మాణ స్థలాలలో ప్రారంభమైంది — అక్కడ fleet owners ఖాళీ machines వల్ల dabbu కోల్పోతుండగా, contractors నమ్మకమైన JCB లేదా crane కోసం రోజులు వేచి ఉండటం చూశారు.",
      "infra demand మరియు agri-rural supply మధ్య ఉన్న ఆ అంతరం — obsession అయింది. Crux Group సమాధానం: verified owners ను equipment వెంటనే కావాల్సిన customers తో కలుపే fleet management platform.",
    ],
  },
  vision: {
    en: "Make India's equipment rental market organised, transparent, and profitable for everyone in the chain.",
    te: "భారతదేశ equipment rental market ను organised, transparent, మరియు chain లోని ప్రతి ఒక్కరికీ profitable గా మార్చడం.",
  },
  goals: {
    en: [
      "Scale across South India — Karnataka, Tamil Nadu, Andhra Pradesh, and Telangana",
      "Expand overseas, starting with the UAE construction corridor",
      "Build a network that accelerates infra projects, maximises fleet owner earnings, and saves customers time and energy",
    ],
    te: [
      "దక్షిణ భారతదేశం అంతటా scale — Karnataka, Tamil Nadu, Andhra Pradesh, మరియు Telangana",
      "UAE construction corridor తో ప్రారంభించి overseas విస్తరణ",
      "infra projects ను వేగవంతం చేసే, fleet owner earnings ను maximise చేసే, customers time & energy save చేసే network నిర్మించడం",
    ],
  },
  quote: {
    en: "Every hour a machine sits idle is money lost. Every hour a contractor waits is a project delayed. We're here to fix both.",
    te: "machine ఒక గంట idle గా ఉంటే dabbu పోతుంది. contractor ఒక గంట వేచితే project ఆలస్యమవుతుంది. రెండూ fix చేయడానికే మేము ఇక్కడ ఉన్నాము.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const title = "Crux Ajay — Founder of Crux Group";
  const description = metaDescription(
    "Meet Crux Ajay — 12+ years in IT, now building South India's equipment rental network. Vision: organised infra, profitable fleet owners, faster bookings from Telangana to UAE.",
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/founder`,
      type: "profile",
    },
    alternates: buildAlternates(locale, "founder"),
    robots: { index: true, follow: true },
  };
}

export default async function FounderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Crux Ajay",
    jobTitle: "Founder",
    worksFor: {
      "@type": "Organization",
      name: "Crux Group",
      url: SITE_URL,
    },
    description: CONTENT.vision.en,
    url: `${SITE_URL}/${locale}/founder`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={personSchema} />

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        <BillingText en={CONTENT.eyebrow.en} te={CONTENT.eyebrow.te} />
      </p>

      <h1 className="mt-3 text-4xl font-extrabold text-offwhite md:text-5xl">
        <BillingText en={CONTENT.name.en} te={CONTENT.name.te} />
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-muted">
        <BillingText en={CONTENT.tagline.en} te={CONTENT.tagline.te} />
      </p>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src="/images/hero-excavator.jpg"
          alt="Construction equipment at a Telangana project site"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(15,14,13,0.85) 0%, rgba(15,14,13,0.2) 60%, transparent 100%)",
          }}
        />
        <blockquote className="absolute inset-x-0 bottom-0 p-6 text-lg font-medium italic text-offwhite md:p-8 md:text-xl">
          &ldquo;
          <BillingText en={CONTENT.quote.en} te={CONTENT.quote.te} />
          &rdquo;
        </blockquote>
      </div>

      <section className="mt-12 space-y-5 leading-relaxed text-muted">
        {(locale === "te" ? CONTENT.story.te : CONTENT.story.en).map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-brand/30 bg-surface/50 p-6 md:p-8">
        <h2 className="text-xl font-bold text-offwhite">
          {locale === "te" ? "దృష్టి" : "Vision"}
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          <BillingText en={CONTENT.vision.en} te={CONTENT.vision.te} />
        </p>

        <h2 className="mt-8 text-xl font-bold text-offwhite">
          {locale === "te" ? "లక్ష్యాలు" : "Goals"}
        </h2>
        <ul className="mt-4 space-y-3">
          {(locale === "te" ? CONTENT.goals.te : CONTENT.goals.en).map((goal) => (
            <li key={goal.slice(0, 40)} className="flex gap-3 text-muted">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button href={BOOKINGS_URL} external variant="primary" size="lg" className="min-h-12">
          {locale === "te" ? "మిషిన్ బుక్ చేయండి" : "Book a Machine"}
        </Button>
        <Button href={`/${locale}#partners`} variant="outline" size="lg" className="min-h-12">
          {locale === "te" ? "మీ Fleet ను Register చేయండి" : "Register Your Fleet"}
        </Button>
      </section>
    </article>
  );
}
