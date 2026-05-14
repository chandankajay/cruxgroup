"use server";

import { revalidatePath } from "next/cache";
import type { SiteBlockType } from "@prisma/client";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../lib/resource-authz";

export type WebsiteCmsActionResult =
  | { success: true }
  | { success: false; error: string };

async function requireAdminGuard(): Promise<void> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) {
    throw new Error("Unauthorized");
  }
}

export async function updateSiteConfig(
  key: string,
  value: string
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    revalidatePath("/website-cms/site-config");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function toggleSectionPublished(
  sectionId: string,
  published: boolean
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    await prisma.siteSection.update({
      where: { id: sectionId },
      data: { published },
    });
    revalidatePath("/website-cms/sections");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function createBlockFromForm(
  formData: FormData
): Promise<void> {
  const slug = String(formData.get("sectionSlug") ?? "");
  const type = formData.get("type") as SiteBlockType;
  if (!slug || !type) return;
  await createBlock(slug, type);
}

export async function deleteBlockFromForm(
  formData: FormData
): Promise<void> {
  const id = String(formData.get("blockId") ?? "");
  const sectionSlug = String(formData.get("sectionSlug") ?? "");
  if (!id || !sectionSlug) return;
  await deleteBlock(id, sectionSlug);
}

export async function createBlock(
  sectionSlug: string,
  type: SiteBlockType
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    const section = await prisma.siteSection.findUnique({
      where: { slug: sectionSlug },
      include: { _count: { select: { blocks: true } } },
    });
    if (!section) return { success: false, error: "Section not found" };
    const order = section._count.blocks + 1;
    await prisma.siteBlock.create({
      data: {
        sectionId: section.id,
        type,
        order,
        heading_en: "New block",
        published: true,
      },
    });
    revalidatePath(`/website-cms/sections/${sectionSlug}`);
    revalidatePath("/website-cms/sections");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return { success: false, error: msg };
  }
}

export async function updateBlock(input: {
  id: string;
  heading_en?: string | null;
  heading_te?: string | null;
  body_en?: string | null;
  body_te?: string | null;
  cta_label_en?: string | null;
  cta_label_te?: string | null;
  cta_href?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  published?: boolean;
}): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    const { id, ...data } = input;
    const existing = await prisma.siteBlock.findUnique({
      where: { id },
      include: { section: { select: { slug: true } } },
    });
    await prisma.siteBlock.update({
      where: { id },
      data,
    });
    if (existing?.section.slug) {
      revalidatePath(`/website-cms/sections/${existing.section.slug}`);
    }
    revalidatePath("/website-cms/sections");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function deleteBlock(
  blockId: string,
  sectionSlug: string
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    await prisma.siteBlock.delete({ where: { id: blockId } });
    revalidatePath(`/website-cms/sections/${sectionSlug}`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return { success: false, error: msg };
  }
}

export async function reorderBlocks(
  sectionSlug: string,
  orderedIds: string[]
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    const section = await prisma.siteSection.findUnique({
      where: { slug: sectionSlug },
    });
    if (!section) return { success: false, error: "Section not found" };

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.siteBlock.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
    revalidatePath(`/website-cms/sections/${sectionSlug}`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reorder failed";
    return { success: false, error: msg };
  }
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function createBlogPost(data: {
  title_en: string;
  title_te?: string | null;
  excerpt_en?: string | null;
  excerpt_te?: string | null;
  body_en: string;
  body_te?: string | null;
  slug?: string | null;
  coverImage?: string | null;
  tags: string[];
  seoTitle?: string | null;
  seoDesc?: string | null;
  authorName?: string | null;
  published?: boolean;
}): Promise<WebsiteCmsActionResult & { id?: string }> {
  try {
    await requireAdminGuard();
    const slug = (data.slug?.trim() || slugifyTitle(data.title_en)).toLowerCase();
    const published = Boolean(data.published);
    const row = await prisma.blogPost.create({
      data: {
        slug,
        title_en: data.title_en,
        title_te: data.title_te ?? null,
        excerpt_en: data.excerpt_en ?? null,
        excerpt_te: data.excerpt_te ?? null,
        body_en: data.body_en,
        body_te: data.body_te ?? null,
        coverImage: data.coverImage ?? null,
        tags: data.tags,
        seoTitle: data.seoTitle ?? null,
        seoDesc: data.seoDesc ?? null,
        authorName: data.authorName ?? null,
        published,
        publishedAt: published ? new Date() : null,
      },
    });
    revalidatePath("/website-cms/blog");
    return { success: true, id: row.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return { success: false, error: msg };
  }
}

export async function updateBlogPost(
  id: string,
  data: {
    title_en: string;
    title_te?: string | null;
    excerpt_en?: string | null;
    excerpt_te?: string | null;
    body_en: string;
    body_te?: string | null;
    slug: string;
    coverImage?: string | null;
    tags: string[];
    seoTitle?: string | null;
    seoDesc?: string | null;
    authorName?: string | null;
    published?: boolean;
  }
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    const published = Boolean(data.published);
    await prisma.blogPost.update({
      where: { id },
      data: {
        slug: data.slug.toLowerCase(),
        title_en: data.title_en,
        title_te: data.title_te ?? null,
        excerpt_en: data.excerpt_en ?? null,
        excerpt_te: data.excerpt_te ?? null,
        body_en: data.body_en,
        body_te: data.body_te ?? null,
        coverImage: data.coverImage ?? null,
        tags: data.tags,
        seoTitle: data.seoTitle ?? null,
        seoDesc: data.seoDesc ?? null,
        authorName: data.authorName ?? null,
        published,
        publishedAt: published
          ? new Date()
          : null,
      },
    });
    revalidatePath("/website-cms/blog");
    revalidatePath(`/website-cms/blog/${id}/edit`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function deleteBlogPostFromForm(
  formData: FormData
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteBlogPost(id);
}

export async function deleteBlogPost(id: string): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/website-cms/blog");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return { success: false, error: msg };
  }
}

export async function toggleBlogPublished(
  id: string,
  published: boolean
): Promise<WebsiteCmsActionResult> {
  try {
    await requireAdminGuard();
    await prisma.blogPost.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? new Date() : null,
      },
    });
    revalidatePath("/website-cms/blog");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: msg };
  }
}
