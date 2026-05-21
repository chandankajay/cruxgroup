import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../lib/resource-authz";

export const dynamic = "force-dynamic";

export default async function WebsiteCmsDashboardPage(): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const [postCount, publishedPosts, blockCount, configCount, sectionCount] =
    await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.siteBlock.count(),
      prisma.siteConfig.count(),
      prisma.siteSection.count(),
    ]);

  const cards = [
    {
      title: "Site config",
      desc: `${configCount} keys`,
      href: "/website-cms/site-config",
    },
    {
      title: "Sections & blocks",
      desc: `${sectionCount} sections · ${blockCount} blocks`,
      href: "/website-cms/sections",
    },
    {
      title: "Blog posts",
      desc: `${postCount} total · ${publishedPosts} published`,
      href: "/website-cms/blog",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Website CMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage public marketing copy, homepage sections, and blog posts.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="font-medium">{c.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
