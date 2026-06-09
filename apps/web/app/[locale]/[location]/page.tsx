import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/seo/json-ld";
import { WhatsAppCta } from "../../../components/seo/whatsapp-cta";
import { getEquipmentForLocation } from "../../../lib/seo/data/equipment";
import { getLocationFaqs } from "../../../lib/seo/data/faq";
import {
  getAllLocationSlugs,
  getLocationBySlug,
  resolveNearbySlug,
  type Location,
} from "../../../lib/seo/data/locations";
import { getUseCaseBySlug } from "../../../lib/seo/data/use-cases";
import {
  RESERVED_LOCATION_SLUGS,
  SEO_LOCALES,
} from "../../../lib/seo/constants";
import {
  ADMIN_URL,
  BOOKINGS_URL,
  PHONE,
  SITE_URL,
} from "../../../lib/env";
import { parseLocale, type Locale } from "../../../lib/locale";

export const revalidate = 86400;

export const dynamicParams = true;

export function generateStaticParams(): { locale: string; location: string }[] {
  return SEO_LOCALES.flatMap((locale) =>
    getAllLocationSlugs().map((location) => ({ locale, location })),
  );
}

function pagePath(locale: string, slug: string): string {
  return `/${locale}/${slug}`;
}

function buildMetaDescription(location: Location): string {
  const terms = location.searchTerms.slice(0, 3);
  const termPhrase =
    terms.length >= 2
      ? `${terms[0]} and ${terms[1]}`
      : terms[0] ?? "heavy equipment rental";
  return `Book verified operators for ${termPhrase} in ${location.displayName}, ${location.district}. JCB, post hole digger, crane and more — ${location.distanceFromHyderabad} from Hyderabad on ${location.nhCorridor}. WhatsApp booking, GST invoices.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; location: string }>;
}): Promise<Metadata> {
  const { locale: raw, location: slug } = await params;
  const locale = parseLocale(raw);
  const location = getLocationBySlug(slug);
  if (!location) return { title: "Location" };

  const title = `Heavy Equipment Rental in ${location.displayName}, ${location.district}`;
  const description = buildMetaDescription(location);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${pagePath(locale, slug)}`,
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}/en/${slug}`,
      languages: {
        en: `${SITE_URL}/en/${slug}`,
        te: `${SITE_URL}/te/${slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}

function buildSchemas(
  location: Location,
  locale: Locale,
  faqs: ReturnType<typeof getLocationFaqs>,
) {
  const locationUrl = `${SITE_URL}${pagePath(locale, location.slug)}`;
  const telanganaUrl = `${SITE_URL}/${locale}/telangana`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Telangana",
          item: telanganaUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: location.displayName,
          item: locationUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Crux Group",
      url: SITE_URL,
      telephone: PHONE || undefined,
      areaServed: {
        "@type": "AdministrativeArea",
        name: `${location.district}, Telangana, India`,
      },
      description: `Heavy equipment rental in ${location.displayName}, ${location.district} district.`,
    },
  ];
}

function equipmentSlugFromName(name: string): string | undefined {
  const map: Record<string, string> = {
    "JCB Backhoe Loader": "jcb",
    "Post Hole Digger": "posthole",
    "Mobile Crane": "crane",
    Excavator: "jcb",
    Tractor: "jcb",
    "Tipper / Dumper": "jcb",
  };
  return map[name];
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string; location: string }>;
}) {
  const { locale: raw, location: slug } = await params;
  const locale = parseLocale(raw);

  if (RESERVED_LOCATION_SLUGS.has(slug)) notFound();

  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const equipment = getEquipmentForLocation(location);
  const faqs = getLocationFaqs(location);
  const useCases = location.useCaseSlugs
    .map((s) => getUseCaseBySlug(s))
    .filter((u): u is NonNullable<typeof u> => u !== undefined);

  const nearbyLinks = location.nearbyAreas
    .map((name) => ({ name, slug: resolveNearbySlug(name) }))
    .filter((n): n is { name: string; slug: string } => n.slug !== undefined)
    .slice(0, 3);

  const descriptionText =
    locale === "te" && location.description_te && !location.needsTranslation
      ? location.description_te
      : location.description;
  const localContextText =
    locale === "te" && location.localContext_te && !location.needsTranslation
      ? location.localContext_te
      : location.localContext;

  const opening = `${descriptionText} Located ${location.distanceFromHyderabad} from Hyderabad along ${location.nhCorridor}, ${location.displayName} is a growing market for ${location.equipmentDemand.toLowerCase()}. Crux Group connects you with verified local operators — no middlemen, no surprise mobilisation charges.`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={buildSchemas(location, locale, faqs)} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href={`/${locale}`} className="font-medium text-brand hover:text-accent">
          Home
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <Link
          href={`/${locale}/telangana`}
          className="font-medium text-brand hover:text-accent"
        >
          Telangana
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span>{location.displayName}</span>
      </nav>

      <h1 className="text-3xl font-bold text-offwhite md:text-4xl">
        Heavy Equipment Rental in {location.displayName}, {location.district}
      </h1>

      <p className="mt-4 leading-relaxed text-muted">{opening}</p>

      <WhatsAppCta
        className="mt-6"
        message={`Hi, I need equipment in ${location.displayName}, ${location.district}.`}
      />

      {useCases.length > 0 ? (
        <section className="mt-10">
          <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
            Common Jobs in {location.displayName}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {useCases.map((uc) => (
              <div
                key={uc.slug}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <h3 className="font-semibold text-offwhite">
                  {locale === "te" ? uc.displayName_te : uc.displayName}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {locale === "te" && uc.description_te
                    ? uc.description_te
                    : uc.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {uc.equipment.map((eq) => (
                    <Link
                      key={eq}
                      href={`/${locale}/equipment/${eq}`}
                      className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-brand hover:border-brand/50"
                    >
                      {eq}
                    </Link>
                  ))}
                  {uc.isPartnerService ? (
                    <span className="text-xs text-amber-400">
                      Fulfilled by our partner network
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          Equipment Available in {location.displayName}
        </h2>
        <ul className="mt-4 space-y-4">
          {equipment.map((item) => {
            const eqSlug = equipmentSlugFromName(item.name);
            return (
              <li
                key={item.name}
                className="rounded-xl border border-border bg-surface p-4"
              >
                {eqSlug ? (
                  <Link href={`/${locale}/equipment/${eqSlug}`}>
                    <h3 className="font-semibold text-offwhite hover:text-brand">
                      {item.name}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="font-semibold text-offwhite">{item.name}</h3>
                )}
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.useCase}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {nearbyLinks.length > 0 ? (
        <section className="mt-10">
          <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
            Also Serving Nearby Areas
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {nearbyLinks.map((nearby) => {
              const nearbyLoc = getLocationBySlug(nearby.slug);
              return (
                <Link
                  key={nearby.slug}
                  href={`/${locale}/${nearby.slug}`}
                  className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
                >
                  <h3 className="font-semibold text-offwhite">
                    {nearbyLoc?.displayName ?? nearby.name}
                  </h3>
                  {nearbyLoc ? (
                    <p className="mt-1 text-xs text-muted">
                      {nearbyLoc.district} · {nearbyLoc.distanceFromHyderabad}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          Areas Served Near {location.displayName}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Crux operators cover {location.displayName} and nearby towns including{" "}
          {location.nearbyAreas.join(", ")}. Major active projects in the area
          include {location.majorProjects.join("; ")}.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          Why Equipment Demand Is High in {location.district}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">{localContextText}</p>
      </section>

      <section className="mt-10">
        <h2 className="border-b border-border pb-2 text-xl font-semibold text-offwhite">
          Frequently Asked Questions — {location.displayName}
        </h2>
        <dl className="mt-4 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-offwhite">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-muted">
          Ready to book equipment in {location.displayName}?
        </p>
        <WhatsAppCta
          className="mt-4 flex justify-center"
          message={`Hi, I need equipment in ${location.displayName}. Please share availability and rates.`}
        />
        <p className="mt-4 text-xs text-muted">
          Or{" "}
          <Link
            href={`${BOOKINGS_URL}/login`}
            className="text-brand hover:text-accent"
          >
            sign in to the bookings app
          </Link>{" "}
          for online booking with live tracking and GST invoice. Fleet partners
          can{" "}
          <Link
            href={`${ADMIN_URL}/login`}
            className="text-brand hover:text-accent"
          >
            register here
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
