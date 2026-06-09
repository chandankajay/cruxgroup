import Link from "next/link";
import { SectionWrapper } from "../ui/SectionWrapper";
import {
  LOCATIONS,
  parseDistanceKm,
  type Location,
} from "../../lib/seo/data/locations";
import type { Locale } from "../../lib/locale";

function topServiceAreaLocations(): Location[] {
  return LOCATIONS.filter(
    (l) =>
      (l.tier === "hyderabad-prime" || l.tier === "orr-corridor") &&
      l.priority <= 2,
  )
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        parseDistanceKm(a.distanceFromHyderabad) -
          parseDistanceKm(b.distanceFromHyderabad),
    )
    .slice(0, 12);
}

export function ServiceAreas({ locale }: { readonly locale: Locale }) {
  const locations = topServiceAreaLocations();

  return (
    <SectionWrapper id="service-areas" dark>
      <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
        {locale === "te"
          ? "Hyderabad & Telangana అంతటా Heavy Equipment"
          : "Heavy Equipment Across Hyderabad & Telangana"}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
        {locale === "te"
          ? "ORR corridor mariyu Hyderabad prime locations lo verified operators"
          : "Verified operators across Hyderabad prime locations and the ORR corridor"}
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {locations.map((loc) => (
          <Link
            key={loc.slug}
            href={`/${locale}/${loc.slug}`}
            className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <h3 className="font-semibold text-offwhite">{loc.displayName}</h3>
            <p className="mt-1 text-xs text-muted">{loc.district}</p>
            {loc.searchTerms[0] ? (
              <span className="mt-3 inline-block w-fit rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs text-brand">
                {loc.searchTerms[0]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center">
        <Link
          href={`/${locale}/telangana`}
          className="text-sm font-medium text-brand hover:text-accent"
        >
          {locale === "te"
            ? "33+ service areas chudandi →"
            : "View all 33+ service areas →"}
        </Link>
      </p>
    </SectionWrapper>
  );
}
