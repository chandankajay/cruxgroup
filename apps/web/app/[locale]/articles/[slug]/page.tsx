import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../../components/seo/json-ld";
import { WhatsAppCta } from "../../../../components/seo/whatsapp-cta";
import {
  ARTICLES,
  getAllArticleSlugs,
  getArticleBySlug,
  getReadingTime,
} from "../../../../lib/seo/data/articles";
import { markdownToHtml } from "../../../../lib/seo/markdown";
import { SEO_LOCALES } from "../../../../lib/seo/constants";
import { SITE_URL } from "../../../../lib/env";
import { buildAlternates, metaDescription } from "../../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../../lib/locale";

export const revalidate = 86400;

export function generateStaticParams(): { locale: string; slug: string }[] {
  return SEO_LOCALES.flatMap((locale) =>
    getAllArticleSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article" };

  return {
    title: article.title,
    description: metaDescription(article.excerpt),
    openGraph: {
      title: article.title,
      description: metaDescription(article.excerpt),
      url: `${SITE_URL}/${locale}/articles/${slug}`,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
    alternates: buildAlternates(locale, `articles/${slug}`),
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const readingTime = getReadingTime(article.content);
  const bodyHtml = markdownToHtml(article.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Crux Group",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/${locale}/articles/${slug}`,
  };

  return (
    <article className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <JsonLd data={articleSchema} />

      <Link
        href={`/${locale}/articles`}
        className="text-sm font-medium text-brand hover:text-accent"
      >
        ← Back to Articles
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-bold text-offwhite md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {article.author} ·{" "}
          {new Date(article.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · {readingTime} min read
        </p>
      </header>

      <div
        className="prose-crux mt-10"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {article.relatedLocations.length > 0 && (
        <section className="mt-10 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-offwhite">
            Related service areas
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {article.relatedLocations.map((loc) => (
              <li key={loc}>
                <Link
                  href={`/${locale}/${loc}`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-brand hover:border-brand/50"
                >
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex justify-center">
        <WhatsAppCta message="Hi, I read your article and need equipment in Telangana." />
      </div>
    </article>
  );
}
