"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdminSession } from "../../../../lib/sales-auth";
import { revalidateServiceAreaPage } from "../../../../lib/services-revalidate";

export async function setServiceAreaPagePublishedAction(input: {
  serviceSlug: string;
  areaSlug: string;
  published: boolean;
  thinContent?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };

  await prisma.serviceAreaPage.upsert({
    where: {
      serviceSlug_areaSlug: {
        serviceSlug: input.serviceSlug,
        areaSlug: input.areaSlug,
      },
    },
    create: {
      serviceSlug: input.serviceSlug,
      areaSlug: input.areaSlug,
      published: input.published,
      thinContent: input.thinContent ?? false,
      lastReviewed: new Date(),
    },
    update: {
      published: input.published,
      thinContent: input.thinContent ?? false,
      lastReviewed: new Date(),
    },
  });

  revalidateServiceAreaPage(input.serviceSlug, input.areaSlug);
  revalidatePath("/website-cms");
  return { ok: true };
}
