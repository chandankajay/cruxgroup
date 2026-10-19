"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdminSession } from "../../../../lib/sales-auth";
import { passesCwa29ServiceAreaQualityGate } from "@repo/lib/service-area-publish-gate";
import { revalidateServiceAreaPage } from "../../../../lib/services-revalidate";

export async function setServiceAreaPagePublishedAction(input: {
  serviceSlug: string;
  areaSlug: string;
  published: boolean;
  thinContent?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };

  const lastReviewed = new Date();
  if (
    input.published &&
    !passesCwa29ServiceAreaQualityGate({
      lastReviewed,
      thinContent: input.thinContent ?? false,
    })
  ) {
    return {
      ok: false,
      error:
        "Cannot publish until the page is reviewed (lastReviewed) and passes the CWA-29 quality gate (thinContent must be false).",
    };
  }

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
      lastReviewed,
    },
    update: {
      published: input.published,
      thinContent: input.thinContent ?? false,
      lastReviewed,
    },
  });

  revalidateServiceAreaPage(input.serviceSlug, input.areaSlug);
  revalidatePath("/website-cms");
  return { ok: true };
}
