"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import type { Prisma } from "@prisma/client";
import { uploadPublicImage } from "../../../../lib/blob-upload";
import { revalidateProjects } from "../../../../lib/services-revalidate";
import { requireAdminSession } from "../../../../lib/sales-auth";

const PATH = "/website-cms/projects";

export type ProjectPhoto = {
  url: string;
  alt: string;
  order: number;
};

export type ProjectRow = {
  id: string;
  title: string;
  serviceSlug: string;
  areaSlug: string | null;
  villageLabel: string | null;
  sizeLabel: string | null;
  published: boolean;
};

export type ProjectDetail = ProjectRow & {
  testimonial: string | null;
  photos: ProjectPhoto[];
  startedAt: Date | null;
  completedAt: Date | null;
};

function normalizePhotos(photos: ProjectPhoto[]): Prisma.InputJsonValue {
  return photos
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p, index) => ({
      url: p.url,
      alt: p.alt.trim(),
      order: index,
    }));
}

export async function fetchProjects(): Promise<ProjectRow[] | null> {
  if (!(await requireAdminSession())) return null;
  return prisma.servicesProject.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      serviceSlug: true,
      areaSlug: true,
      villageLabel: true,
      sizeLabel: true,
      published: true,
    },
  });
}

export async function fetchProjectById(id: string): Promise<ProjectDetail | null> {
  if (!(await requireAdminSession())) return null;
  const row = await prisma.servicesProject.findUnique({ where: { id } });
  if (!row) return null;
  const photos = Array.isArray(row.photos)
    ? (row.photos as ProjectPhoto[])
    : [];
  return {
    id: row.id,
    title: row.title,
    serviceSlug: row.serviceSlug,
    areaSlug: row.areaSlug,
    villageLabel: row.villageLabel,
    sizeLabel: row.sizeLabel,
    published: row.published,
    testimonial: row.testimonial,
    photos,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  };
}

export async function uploadProjectPhotoAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file uploaded." };
  }
  const upload = await uploadPublicImage("website/projects", file);
  if (!upload.ok) return { ok: false, error: upload.error };
  return { ok: true, url: upload.url };
}

export async function upsertProjectAction(input: {
  id?: string;
  title: string;
  serviceSlug: string;
  areaSlug?: string;
  villageLabel?: string;
  sizeLabel?: string;
  testimonial?: string;
  published: boolean;
  photos: ProjectPhoto[];
  startedAt?: string;
  completedAt?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (input.photos.length === 0) {
    return { ok: false, error: "Add at least one project photo." };
  }
  for (const p of input.photos) {
    if (!p.alt.trim()) {
      return { ok: false, error: "Every photo needs alt text." };
    }
  }

  const data = {
    title,
    serviceSlug: input.serviceSlug.trim(),
    areaSlug: input.areaSlug?.trim() || null,
    villageLabel: input.villageLabel?.trim() || null,
    sizeLabel: input.sizeLabel?.trim() || null,
    testimonial: input.testimonial?.trim() || null,
    published: input.published,
    photos: normalizePhotos(input.photos),
    startedAt: input.startedAt ? new Date(input.startedAt) : null,
    completedAt: input.completedAt ? new Date(input.completedAt) : null,
  };

  const row = input.id
    ? await prisma.servicesProject.update({ where: { id: input.id }, data })
    : await prisma.servicesProject.create({ data });

  revalidateProjects(row.serviceSlug, row.areaSlug);
  revalidatePath(PATH);
  revalidatePath(`/website-cms/projects/${row.id}/edit`);
  return { ok: true, id: row.id };
}
