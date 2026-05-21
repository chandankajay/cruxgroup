import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";
import { SectionPublishedToggle } from "./section-published-toggle";

export const dynamic = "force-dynamic";

export default async function WebsiteSectionsPage(): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const sections = await prisma.siteSection.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { blocks: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Sections & blocks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle visibility and edit blocks per section.
        </p>
      </div>

      <ul className="divide-y rounded-xl border bg-card">
        {sections.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <p className="font-medium">{s.slug}</p>
              <p className="text-xs text-muted-foreground">
                order {s.order} · {s._count.blocks} blocks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SectionPublishedToggle id={s.id} initial={s.published} />
              <Link
                href={`/website-cms/sections/${s.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit blocks
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
