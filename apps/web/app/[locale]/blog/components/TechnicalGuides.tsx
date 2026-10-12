import Link from "next/link";
import type { Locale } from "../../../../lib/locale";
import { TECHNICAL_GUIDES } from "../../../../lib/seo/data/technical-guides";

const sortedGuides = [...TECHNICAL_GUIDES].sort((a, b) => a.sortOrder - b.sortOrder);

export function TechnicalGuides({
  locale,
}: {
  readonly locale: Locale;
}): React.ReactElement {
  if (sortedGuides.length === 0) {
    return <></>;
  }

  return (
    <section className="mb-14">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Engineering Reference Library
        </p>
        <h2 className="mt-2 text-2xl font-bold text-offwhite">
          Land Development, Levelling &amp; Civil Specs
        </h2>
        <p className="mt-2 text-sm text-muted">
          From raw venture land to survey-ready plots, compound walls, and
          foundations — engineering references for site teams. No pricing.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedGuides.map((guide) => (
          <article
            key={guide.slug}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface/80 transition-shadow hover:shadow-[0_0_24px_rgba(212,88,0,0.12)]"
          >
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-brand/20 via-surface to-dark/80 px-6">
              <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                {guide.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold text-offwhite">{guide.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                {guide.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span>Crux Agri &amp; Rural Services LLP</span>
                <span aria-hidden>·</span>
                <span>{guide.readMinutes} min read</span>
              </div>
              <Link
                href={`/${locale}/articles/${guide.slug}`}
                className="mt-4 text-sm font-semibold text-brand hover:text-accent"
              >
                Read reference →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
