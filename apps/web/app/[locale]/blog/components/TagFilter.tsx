"use client";

import type { BlogPost } from "@prisma/client";
import { useMemo, useState } from "react";
import { cn } from "../../../../lib/cn";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../../../lib/locale";
import { BillingText } from "../../../../components/ui/BillingText";

export function TagFilter({
  posts,
  locale,
}: {
  readonly posts: BlogPost[];
  readonly locale: Locale;
}): React.ReactElement {
  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const p of posts) {
      for (const t of p.tags) s.add(t);
    }
    return Array.from(s).sort();
  }, [posts]);

  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!tag) return posts;
    return posts.filter((p) => p.tags.includes(tag));
  }, [posts, tag]);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTag(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            tag === null
              ? "border-brand bg-brand text-offwhite"
              : "border-border text-muted hover:border-brand/50"
          )}
        >
          All
        </button>
        {allTags.map((t: string) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              tag === t
                ? "border-brand bg-brand text-offwhite"
                : "border-border text-muted hover:border-brand/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/80 p-10 text-center text-muted">
          No posts match this tag.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface/80 transition-shadow hover:shadow-[0_0_24px_rgba(212,88,0,0.12)]"
            >
              {post.coverImage ? (
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] w-full bg-border/40" />
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold text-offwhite">
                  <BillingText en={post.title_en} te={post.title_te} />
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                  <BillingText
                    en={post.excerpt_en ?? ""}
                    te={post.excerpt_te ?? post.excerpt_en}
                  />
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString("en-IN")}
                    </time>
                  ) : null}
                  {post.tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="rounded bg-dark/60 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="mt-4 text-sm font-semibold text-brand hover:text-accent"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
