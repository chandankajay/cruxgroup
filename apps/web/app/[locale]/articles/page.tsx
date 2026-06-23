import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, getReadingTime } from "../../../lib/seo/data/articles";
import { getTechnicalGuidesByPillar } from "../../../lib/seo/data/technical-guides";
import { SITE_URL } from "../../../lib/env";
import { buildAlternates, metaDescription } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";

export const revalidate = 86400;

const landDevelopmentGuides = getTechnicalGuidesByPillar("land-development");
const perimeterGuides = getTechnicalGuidesByPillar("perimeter");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const title = "Equipment Rental Guides & Telangana Infrastructure Insights";
  const description = metaDescription(
    "JCB rental rates, auger and post hole digger uses, GST invoicing, infrastructure trends, and the fleet partner income model across Telangana.",
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/articles`,
      type: "website",
    },
    alternates: buildAlternates(locale, "articles"),
    robots: { index: true, follow: true },
  };
}

export default async function ArticlesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-muted">
        <Link
          href={`/${locale}/telangana`}
          className="font-medium text-brand hover:text-accent"
        >
          Telangana
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span>Articles</span>
      </nav>

      <h1 className="text-3xl font-bold text-offwhite md:text-4xl">
        Equipment Rental Guides &amp; Insights
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Practical advice for Telangana contractors and fleet partners — rates,
        compliance, infrastructure trends, and how digital booking works.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-offwhite">
          Engineering Reference Library
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Civil specifications for site engineers — land development, levelling,
          perimeter systems. No pricing, no sales copy.
        </p>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand">
          Land development &amp; levelling
        </h3>
        <ul className="mt-4 space-y-4">
          {landDevelopmentGuides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/${locale}/articles/${guide.slug}`}
                className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {guide.tag}
                </span>
                <h4 className="mt-1 text-lg font-semibold text-offwhite">
                  {guide.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {guide.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted">
                  Crux Agri &amp; Rural Services LLP ·{" "}
                  {new Date(guide.datePublished).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {guide.readMinutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand">
          Compound wall &amp; boundary
        </h3>
        <ul className="mt-4 space-y-4">
          {perimeterGuides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/${locale}/articles/${guide.slug}`}
                className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {guide.tag}
                </span>
                <h4 className="mt-1 text-lg font-semibold text-offwhite">
                  {guide.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {guide.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted">
                  Crux Agri &amp; Rural Services LLP ·{" "}
                  {new Date(guide.datePublished).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {guide.readMinutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-offwhite">Equipment &amp; operations</h2>
        <ul className="mt-5 space-y-6">
          {ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/${locale}/articles/${article.slug}`}
                className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
              >
                <h3 className="text-lg font-semibold text-offwhite">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {article.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted">
                  {article.author} ·{" "}
                  {new Date(article.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {getReadingTime(article.content)} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
