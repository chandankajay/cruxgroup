import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, getReadingTime } from "../../../lib/seo/data/articles";
import { SITE_URL } from "../../../lib/env";
import { buildAlternates, metaDescription } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";

export const revalidate = 86400;

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

      <ul className="mt-8 space-y-6">
        {ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/${locale}/articles/${article.slug}`}
              className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <h2 className="text-lg font-semibold text-offwhite">
                {article.title}
              </h2>
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
    </div>
  );
}
