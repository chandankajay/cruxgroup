import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPublishedPostSlugs,
} from "../../../../lib/content";
import { SITE_URL } from "../../../../lib/env";
import { buildAlternates, metaDescription } from "../../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../../lib/locale";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<
  { locale: string; slug: string }[]
> {
  const slugs = await getPublishedPostSlugs();
  const locales = ["en", "te"] as const;
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const post = await getPostBySlug(slug);
  if (!post?.published) {
    return { title: "Post" };
  }
  const title =
    locale === "te" && post.title_te
      ? post.title_te
      : post.title_en;
  const description =
    locale === "te" && post.excerpt_te
      ? post.excerpt_te
      : post.excerpt_en ?? post.seoDesc ?? undefined;
  const metaTitle = post.seoTitle ?? title;
  const metaDesc = metaDescription(
    post.seoDesc ?? description ?? metaTitle,
  );

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      type: "article" as const,
      url: `${SITE_URL}/${locale}/blog/${slug}`,
    },
    alternates: buildAlternates(locale, `blog/${slug}`),
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const title =
    locale === "te" && post.title_te ? post.title_te : post.title_en;
  const bodyHtml =
    locale === "te" && post.body_te && post.body_te.trim().length > 0
      ? post.body_te
      : post.body_en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Crux Group",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <article className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${locale}/blog`}
        className="text-sm font-medium text-brand hover:text-accent"
      >
        ← Back to Blog
      </Link>

      {post.coverImage ? (
        <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="720px"
          />
        </div>
      ) : null}

      <header className="mt-8">
        <h1 className="text-3xl font-bold text-offwhite md:text-4xl">
          {title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
          {post.authorName ? <span>{post.authorName}</span> : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt.toISOString()}>
              {post.publishedAt.toLocaleDateString("en-IN")}
            </time>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((t: string) => (
            <span
              key={t}
              className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      <div
        className="prose-crux mt-10"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </article>
  );
}
