import type { Metadata } from "next";
import { getAllPublishedPosts } from "../../../lib/content";
import { SITE_URL } from "../../../lib/env";
import { buildAlternates, metaDescription } from "../../../lib/seo/metadata-helpers";
import { parseLocale } from "../../../lib/locale";
import { TagFilter } from "./components/TagFilter";
import { TechnicalGuides } from "./components/TechnicalGuides";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const title = "Blog";
  const description = metaDescription(
    "Field insights on JCB rental, post hole diggers, crane hire, safety and operations across Telangana — guides for contractors and fleet partners.",
  );

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Crux Group`,
      description,
      url: `${SITE_URL}/${locale}/blog`,
      siteName: "Crux Group",
      type: "website",
    },
    alternates: buildAlternates(locale, "blog"),
    robots: { index: true, follow: true },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  const posts = await getAllPublishedPosts();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-offwhite">Insights from the Field</h1>
        <p className="mt-3 text-base text-muted">
          Stories from dispatch, fleet partners, and job sites across Telangana.
        </p>
      </header>

      <TechnicalGuides locale={locale} />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-8 py-16 text-center">
          <p className="text-lg text-muted">
            Coming soon — our team is writing for you.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-8 text-2xl font-bold text-offwhite">Latest posts</h2>
          <TagFilter posts={posts} locale={locale} />
        </>
      )}
    </div>
  );
}