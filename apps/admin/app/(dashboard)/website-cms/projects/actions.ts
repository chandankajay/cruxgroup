"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdminSession } from "../../../../lib/sales-auth";

const PATH = "/website-cms/projects";

export type ProjectRow = {
  id: string;
  title: string;
  serviceSlug: string;
  areaSlug: string | null;
  villageLabel: string | null;
  sizeLabel: string | null;
  published: boolean;
};

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

export async function upsertProjectAction(input: {
  id?: string;
  title: string;
  serviceSlug: string;
  areaSlug?: string;
  villageLabel?: string;
  sizeLabel?: string;
  testimonial?: string;
  published: boolean;
  photos: { url: string; alt: string }[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };

  const data = {
    title,
    serviceSlug: input.serviceSlug.trim(),
    areaSlug: input.areaSlug?.trim() || null,
    villageLabel: input.villageLabel?.trim() || null,
    sizeLabel: input.sizeLabel?.trim() || null,
    testimonial: input.testimonial?.trim() || null,
    published: input.published,
    photos: input.photos,
  };

  const row = input.id
    ? await prisma.servicesProject.update({ where: { id: input.id }, data })
    : await prisma.servicesProject.create({ data });

  revalidatePath(PATH);
  revalidatePath("/");
  return { ok: true, id: row.id };
}
