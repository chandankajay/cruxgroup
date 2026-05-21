"use client";

import type { BlogPost } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBlogPost, updateBlogPost } from "../actions";
import { TiptapField } from "./tiptap-field";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function BlogPostForm({
  mode,
  initial,
}: {
  readonly mode: "new" | "edit";
  readonly initial?: BlogPost;
}): React.ReactElement {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [titleTe, setTitleTe] = useState(initial?.title_te ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerptEn, setExcerptEn] = useState(initial?.excerpt_en ?? "");
  const [excerptTe, setExcerptTe] = useState(initial?.excerpt_te ?? "");
  const [bodyEn, setBodyEn] = useState(initial?.body_en ?? "<p></p>");
  const [bodyTe, setBodyTe] = useState(initial?.body_te ?? "");
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "");
  const [author, setAuthor] = useState(initial?.authorName ?? "");

  function slugify(title: string): void {
    const s = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    setSlug(s);
  }

  function save(publish: boolean): void {
    setMsg(null);
    start(async () => {
      const tagList = parseTags(tags);
      if (mode === "new") {
        const res = await createBlogPost({
          title_en: titleEn,
          title_te: titleTe || null,
          excerpt_en: excerptEn || null,
          excerpt_te: excerptTe || null,
          body_en: bodyEn,
          body_te: bodyTe || null,
          slug: slug || null,
          coverImage: cover || null,
          tags: tagList,
          seoTitle: seoTitle || null,
          seoDesc: seoDesc || null,
          authorName: author || null,
          published: publish,
        });
        if (res.success && res.id) {
          router.push(`/website-cms/blog/${res.id}/edit`);
        } else {
          setMsg(res.success ? "" : res.error);
        }
      } else if (initial) {
        const finalSlug =
          slug.trim() ||
          titleEn
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 80) ||
          "post";
        const res = await updateBlogPost(initial.id, {
          title_en: titleEn,
          title_te: titleTe || null,
          excerpt_en: excerptEn || null,
          excerpt_te: excerptTe || null,
          body_en: bodyEn,
          body_te: bodyTe || null,
          slug: finalSlug,
          coverImage: cover || null,
          tags: tagList,
          seoTitle: seoTitle || null,
          seoDesc: seoDesc || null,
          authorName: author || null,
          published: publish,
        });
        setMsg(res.success ? "Saved" : res.error);
        if (res.success) router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Title (EN)</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={titleEn}
            onChange={(e) => {
              setTitleEn(e.target.value);
              if (mode === "new") slugify(e.target.value);
            }}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Title (TE)</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={titleTe}
            onChange={(e) => setTitleTe(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span>Slug</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Excerpt (EN)</span>
          <textarea
            className="min-h-[72px] w-full rounded-md border bg-background px-3 py-2"
            value={excerptEn}
            onChange={(e) => setExcerptEn(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Excerpt (TE)</span>
          <textarea
            className="min-h-[72px] w-full rounded-md border bg-background px-3 py-2"
            value={excerptTe}
            onChange={(e) => setExcerptTe(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Body (EN)</p>
          <TiptapField value={bodyEn} onChange={setBodyEn} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Body (TE)</p>
          <TiptapField
            value={bodyTe || "<p></p>"}
            onChange={setBodyTe}
            placeholder="Optional Telugu body"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 lg:col-span-2">
        <p className="mb-2 text-sm font-medium">Preview (EN)</p>
        <div
          className="prose-crux max-h-64 overflow-auto rounded-md border bg-background p-3 text-sm"
          dangerouslySetInnerHTML={{ __html: bodyEn }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Cover image URL</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Tags (comma-separated)</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>SEO title</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>SEO description</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span>Author</span>
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => save(false)}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => save(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Publish
        </button>
        {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
      </div>
    </div>
  );
}
