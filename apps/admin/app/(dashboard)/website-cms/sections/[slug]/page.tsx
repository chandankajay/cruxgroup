import { notFound, redirect } from "next/navigation";
import type { SiteBlockType } from "@prisma/client";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../../../lib/resource-authz";
import { createBlockFromForm } from "../../actions";
import { BlockSortableList } from "./block-sortable-list";

export const dynamic = "force-dynamic";

const BLOCK_TYPES: SiteBlockType[] = [
  "HERO",
  "STAT",
  "FEATURE_CARD",
  "EQUIPMENT_CARD",
  "TESTIMONIAL",
  "FAQ_ITEM",
  "HOOK_BANNER",
  "CTA_STRIP",
];

export default async function SectionBlocksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const { slug } = await params;
  const section = await prisma.siteSection.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Section: {section.slug}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag blocks to reorder. Save each block after edits.
        </p>
      </div>

      <BlockSortableList sectionSlug={section.slug} blocks={section.blocks} />

      <form action={createBlockFromForm} className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
        <input type="hidden" name="sectionSlug" value={section.slug} />
        <select
          name="type"
          className="rounded-md border bg-background px-2 py-2 text-sm"
        >
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add block
        </button>
      </form>
    </div>
  );
}
