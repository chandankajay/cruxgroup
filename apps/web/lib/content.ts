import "server-only";

import type { BlogPost, SiteBlock, SiteSection } from "@prisma/client";
import { prisma } from "@repo/db";

export type SiteConfigMap = Record<string, string>;

export async function getSiteConfig(key: string): Promise<string> {
  const row = await prisma.siteConfig.findUnique({ where: { key } });
  return row?.value ?? "";
}

export async function getSiteConfigMap(keys: string[]): Promise<SiteConfigMap> {
  if (keys.length === 0) return {};
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: keys } },
  });
  const map: SiteConfigMap = {};
  for (const k of keys) map[k] = "";
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export type SiteSectionWithBlocks = SiteSection & { blocks: SiteBlock[] };

export async function getSiteSection(
  slug: string
): Promise<SiteSectionWithBlocks | null> {
  const section = await prisma.siteSection.findFirst({
    where: { slug, published: true },
    include: {
      blocks: {
        where: { published: true },
        orderBy: { order: "asc" },
      },
    },
  });
  return section;
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
