import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/seo/json-ld";
import { SITE_URL } from "../env";
import { getTechnicalGuideBySlug } from "./data/technical-guides";
import { buildAlternates, metaDescription, seoTitle } from "./metadata-helpers";
import type { Locale } from "../locale";

export function buildTechnicalGuideMetadata(
  slug: string,
  locale: Locale | string,
): Metadata {
  const guide = getTechnicalGuideBySlug(slug);
  if (!guide) return { title: "Engineering Reference" };

  const description = metaDescription(guide.seoDescription);

  return {
    title: seoTitle(guide.title),
    description,
    openGraph: {
      title: guide.title,
      description,
      url: `${SITE_URL}/${locale}/articles/${slug}`,
      type: "article",
      siteName: "Crux Group",
    },
    alternates: buildAlternates(locale, `articles/${slug}`),
    robots: { index: true, follow: true },
  };
}

export function TechnicalGuideArticleShell({
  slug,
  locale,
  children,
}: {
  readonly slug: string;
  readonly locale: Locale | string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  const guide = getTechnicalGuideBySlug(slug);

  const articleSchema = guide
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: metaDescription(guide.seoDescription),
        datePublished: guide.datePublished,
        dateModified: guide.datePublished,
        author: {
          "@type": "Organization",
          name: "Crux Agri & Rural Services LLP",
        },
        publisher: {
          "@type": "Organization",
          name: "Crux Group",
          url: SITE_URL,
        },
        mainEntityOfPage: `${SITE_URL}/${locale}/articles/${slug}`,
        about: guide.about,
      }
    : null;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {articleSchema ? <JsonLd data={articleSchema} /> : null}

      <Link
        href={`/${locale}/articles`}
        className="text-sm font-medium text-brand hover:text-accent"
      >
        ← Back to Articles
      </Link>

      <div className="mt-8">{children}</div>
    </article>
  );
}
