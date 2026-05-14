"use client";

import type { SiteBlock } from "@prisma/client";
import { useState, useTransition } from "react";
import { deleteBlockFromForm, updateBlock } from "../../actions";

export function BlockEditorForm({
  block,
  sectionSlug,
}: {
  readonly block: SiteBlock;
  readonly sectionSlug: string;
}): React.ReactElement {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [fields, setFields] = useState({
    heading_en: block.heading_en ?? "",
    heading_te: block.heading_te ?? "",
    body_en: block.body_en ?? "",
    body_te: block.body_te ?? "",
    cta_label_en: block.cta_label_en ?? "",
    cta_label_te: block.cta_label_te ?? "",
    cta_href: block.cta_href ?? "",
    imageUrl: block.imageUrl ?? "",
    icon: block.icon ?? "",
  });

  function save(): void {
    setMsg(null);
    start(async () => {
      const res = await updateBlock({
        id: block.id,
        heading_en: fields.heading_en || null,
        heading_te: fields.heading_te || null,
        body_en: fields.body_en || null,
        body_te: fields.body_te || null,
        cta_label_en: fields.cta_label_en || null,
        cta_label_te: fields.cta_label_te || null,
        cta_href: fields.cta_href || null,
        imageUrl: fields.imageUrl || null,
        icon: fields.icon || null,
      });
      setMsg(res.success ? "Saved" : res.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">heading_en</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.heading_en}
            onChange={(e) =>
              setFields((f) => ({ ...f, heading_en: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">heading_te</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.heading_te}
            onChange={(e) =>
              setFields((f) => ({ ...f, heading_te: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs sm:col-span-2">
          <span className="text-muted-foreground">body_en</span>
          <textarea
            className="min-h-[72px] w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.body_en}
            onChange={(e) =>
              setFields((f) => ({ ...f, body_en: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs sm:col-span-2">
          <span className="text-muted-foreground">body_te</span>
          <textarea
            className="min-h-[72px] w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.body_te}
            onChange={(e) =>
              setFields((f) => ({ ...f, body_te: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">cta_label_en</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.cta_label_en}
            onChange={(e) =>
              setFields((f) => ({ ...f, cta_label_en: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">cta_label_te</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.cta_label_te}
            onChange={(e) =>
              setFields((f) => ({ ...f, cta_label_te: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs sm:col-span-2">
          <span className="text-muted-foreground">cta_href</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.cta_href}
            onChange={(e) =>
              setFields((f) => ({ ...f, cta_href: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">imageUrl</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.imageUrl}
            onChange={(e) =>
              setFields((f) => ({ ...f, imageUrl: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">icon (Lucide name)</span>
          <input
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={fields.icon}
            onChange={(e) =>
              setFields((f) => ({ ...f, icon: e.target.value }))
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Save block
        </button>
        {msg ? <span className="text-xs text-muted-foreground">{msg}</span> : null}
        <form action={deleteBlockFromForm} className="ml-auto">
          <input type="hidden" name="blockId" value={block.id} />
          <input type="hidden" name="sectionSlug" value={sectionSlug} />
          <button
            type="submit"
            className="text-sm text-destructive hover:underline"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
