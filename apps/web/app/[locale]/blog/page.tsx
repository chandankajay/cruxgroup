import type { Metadata } from "next";
import { getAllPublishedPosts } from "../../../lib/content";
import { SITE_URL } from "../../../lib/env";
import { parseLocale } from "../../../lib/locale";
import { TagFilter } from "./components/TagFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights from the field — equipment, operations, and safety.",
  openGraph: {
    title: "Blog — Crux Group",
    description: "Insights from the field.",
    url: `${SITE_URL}/en/blog`,
    siteName: "Crux Group",
    type: "website",
  },
};

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  const posts = await getAllPublishedPosts();
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).sort();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-offwhite">Insights from the Field</h1>
        <p className="mt-3 text-muted">
          Stories from dispatch, fleet partners, and job sites across Telangana.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-8 py-16 text-center">
          <p className="text-lg text-muted">
            Coming soon — our team is writing for you.
          </p>
        </div>
      ) : (
        <TagFilter posts={posts} locale={locale} />
      )}
    </div>
  );
}
