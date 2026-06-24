import Link from "next/link";
import { SectionWrapper } from "../ui/SectionWrapper";
import {
  getServiceBody,
  getServiceTitle,
  SITE_SERVICES,
} from "../../lib/seo/data/services";
import type { Locale } from "../../lib/locale";

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}

export function SiteServices({ locale }: { readonly locale: Locale }) {
  const allSearchTerms = SITE_SERVICES.flatMap((s) => s.searchTerms);

  return (
    <SectionWrapper id="services">
      <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
        {locale === "te" ? "సైట్ సేవలు" : "Site Services We Offer"}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
        {locale === "te"
          ? "Compound fencing, levelling, debris clearing, rock breaking — venture plots mariyu industrial sites kosam."
          : "Compound fencing, levelling, debris clearing, and rock breaking for venture plots and industrial sites across Telangana."}
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SITE_SERVICES.map((service) => (
          <Link
            key={service.slug}
            href={`/${locale}/services/${service.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
              {locale === "te" ? service.eyebrow_te : service.eyebrow_en}
            </p>
            <h3 className="mt-2 font-semibold text-offwhite group-hover:text-brand">
              {getServiceTitle(service, locale)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {firstSentence(getServiceBody(service, locale))}
            </p>
            <span className="mt-auto pt-4 text-xs font-medium text-brand group-hover:text-accent">
              {locale === "te" ? "వివరాలు →" : "Learn more →"}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center">
        <Link
          href={`/${locale}/services`}
          className="text-sm font-medium text-brand hover:text-accent"
        >
          {locale === "te" ? "అన్ని సేవలు చూడండి →" : "View all services →"}
        </Link>
      </p>

      <ul aria-hidden className="sr-only">
        {allSearchTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
