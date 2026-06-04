"use server";

import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { requireAdminResourceAuthz } from "../../../lib/resource-authz";
import { uploadPublicImage } from "../../../lib/blob-upload";

export interface CatalogRow {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  minHourlyRate: number;
  maxHourlyRate: number;
  minDailyRate: number;
  maxDailyRate: number;
}

export async function listMasterCatalogAction(): Promise<CatalogRow[]> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return [];

  const rows = await prisma.masterCatalog.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    imageUrl: r.imageUrl,
    minHourlyRate: r.minHourlyRate,
    maxHourlyRate: r.maxHourlyRate,
    minDailyRate: r.minDailyRate,
    maxDailyRate: r.maxDailyRate,
  }));
}

export type CatalogUpdateResult =
  | { success: true }
  | { success: false; error: string };

export async function updateMasterCatalogImageAction(
  formData: FormData
): Promise<CatalogUpdateResult> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) return { success: false, error: "Unauthorized" };

  const catalogId = String(formData.get("catalogId") ?? "").trim();
  if (!catalogId) return { success: false, error: "Missing catalog ID." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No image provided." };
  }

  const existing = await prisma.masterCatalog.findUnique({
    where: { id: catalogId },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "Catalog type not found." };

  const result = await uploadPublicImage(`catalog/${catalogId}`, file);
  if (!result.ok) return { success: false, error: result.error };

  await prisma.masterCatalog.update({
    where: { id: catalogId },
    data: { imageUrl: result.url },
  });

  revalidatePath("/catalog");
  revalidatePath("/fleet/new");
  return { success: true };
}
