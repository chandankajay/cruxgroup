import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../../components/seo/json-ld";
import { WhatsAppCta } from "../../../components/seo/whatsapp-cta";
import {
  LOCATIONS,
  getLocationsByTier,
  type LocationTier,
} from "../../../lib/seo/data/locations";
import { ADMIN_URL, BOOKINGS_URL, PHONE, SITE_URL } from "../../../lib/env";
import { buildAlternates, metaDescription } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";

export const revalidate = 86400;

const TIER_SECTIONS: { tier: LocationTier; heading: string }[] = [
  { tier: "hyderabad-prime", heading: "Hyderabad Prime Locations" },
  { tier: "orr-corridor", heading: "ORR Corridor" },
  { tier: "district-hq", heading: "District Towns" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const title = "Heavy Equipment Rental Across Telangana";
  const description = metaDescription(
    "Book JCB, excavator, crane, post hole digger (auger), tractor and tipper across Telangana. Verified operators, WhatsApp booking, GST invoices. Kokapet to Warangal, Nizamabad to Khammam.",
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/telangana`,
      type: "website",
    },
    alternates: buildAlternates(locale, "telangana"),
    robots: { index: true, follow: true },
  };
}

function LocationGrid({
  locations,
  locale,
}: {
  readonly locations: typeof LOCATIONS;
  readonly locale: string;
}) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {locations.map((loc) => (
        <Link
          key={loc.slug}
          href={`/${locale}/${loc.slug}`}
          className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
        >
          <h3 className="font-semibold text-offwhite">{loc.displayName}</h3>
          <p className="mt-1 text-xs text-muted">
            {loc.district} district · {loc.distanceFromHyderabad} from Hyderabad
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-offwhite">Key project: </span>
            {loc.majorProjects[0]}
          </p>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-offwhite">In demand: </span>
            {loc.equipmentDemand}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default async function TelanganaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Crux Group",
    url: SITE_URL,
    telephone: PHONE || undefined,
    areaServed: { "@type": "State", name: "Telangana, India" },
    description:
      "Heavy equipment rental network across Telangana — JCB, excavator, crane, post hole digger, tractor, tipper.",
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={localBusiness} />

      <h1 className="text-3xl font-bold text-offwhite md:text-4xl">
        Heavy Equipment Rental Across Telangana — Crux Group
      </h1>

      <p className="mt-2 text-sm font-medium text-brand">
        Serving {LOCATIONS.length}+ locations across Telangana
      </p>

      <p className="mt-4 leading-relaxed text-muted">
        Telangana is in the middle of one of India&apos;s largest infrastructure
        buildouts — ₹1 lakh crore in PMGSY rural road projects, Mission
        Bhagiratha water pipelines, Kaleshwaram irrigation, industrial corridors
        from NIMZ Shadnagar to TSSIDC Karimnagar, and real estate expansion
        across the Hyderabad periphery. Every one of these projects needs
        earthmovers, cranes, and tippers on site. Most of it is still booked
        through phone calls, junction brokers, and word of mouth — with no GST
        invoice, no operator verification, and no recourse when a machine
        doesn&apos;t show up.
      </p>

      <p className="mt-4 leading-relaxed text-muted">
        Hyderabad&apos;s periphery construction boom is reshaping equipment demand
        — Kokapet&apos;s Neopolis skyscrapers need foundation holes and earthing
        pits, Tukkuguda&apos;s data centre corridor drives warehouse excavation and
        industrial fencing, Adibatla&apos;s aerospace SEZ keeps JCBs and auger
        machines busy year-round, and ORR expansion is opening plotted layouts
        from Nallagandla to Ghatkesar. Crux Group connects contractors with
        verified operators across these hotspots — book via WhatsApp or the
        bookings app, get a GST invoice, and track your rental from
        mobilisation to completion.
      </p>

      <WhatsAppCta className="mt-6" message="Hi, I need equipment in Telangana." />

      {TIER_SECTIONS.map(({ tier, heading }) => {
        const tierLocations = getLocationsByTier(tier);
        if (tierLocations.length === 0) return null;
        return (
          <section key={tier} className="mt-10">
            <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
              {heading}
            </h2>
            <LocationGrid locations={tierLocations} locale={locale} />
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          The NH44 Corridor — South Telangana&apos;s Growth Spine
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          National Highway 44 from Hyderabad to Mumbai is the backbone of South
          Telangana&apos;s industrial expansion. Kothur, Shamshabad, Shadnagar,
          and Jadcherla all sit on this corridor — each with distinct equipment
          demand driven by logistics parks, NIMZ manufacturing, pharma factories,
          and plotted developments. Contractors working multiple sites along NH44
          benefit from Crux&apos;s network of local operators who mobilise without
          the half-day delay of sourcing machines from central Hyderabad.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          Guides &amp; Resources
        </h2>
        <p className="mt-4 text-muted">
          <Link
            href={`/${locale}/articles`}
            className="font-medium text-brand hover:text-accent"
          >
            Equipment rental guides and Telangana infrastructure insights →
          </Link>
        </p>
      </section>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-offwhite">
          Book Equipment or Join as a Fleet Partner
        </h2>
        <p className="mt-2 text-sm text-muted">
          Need a machine on site? Message us on WhatsApp. Own equipment and want
          passive income? Register as a fleet partner.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <WhatsAppCta message="Hi, I need equipment in Telangana." />
          <Link
            href={`${ADMIN_URL}/login`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-brand px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
          >
            Register as Fleet Partner
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Online booking:{" "}
          <Link
            href={`${BOOKINGS_URL}/login`}
            className="text-brand hover:text-accent"
          >
            bookings.cruxgroup.in
          </Link>
        </p>
      </div>
    </article>
  );
}
