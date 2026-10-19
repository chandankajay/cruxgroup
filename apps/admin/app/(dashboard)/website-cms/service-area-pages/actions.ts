"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import {
  isFirstReleaseServiceAreaPair,
  passesCwa29ServiceAreaQualityGate,
} from "@repo/lib/service-area-publish-gate";
import { setServiceAreaPagePublishedSchema } from "@repo/validators/service-area-cms";
import { requireAdminSession } from "../../../../lib/sales-auth";
import { revalidateServiceAreaPage } from "../../../../lib/services-revalidate";

export async function setServiceAreaPagePublishedAction(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdminSession())) return { ok: false, error: "Forbidden" };

  const parsed = setServiceAreaPagePublishedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }

  const { serviceSlug, areaSlug, published, thinContent } = parsed.data;

  if (published && !isFirstReleaseServiceAreaPair(serviceSlug, areaSlug)) {
    return {
      ok: false,
      error:
        "Only farmhouse-construction pages for fatimapur-kothur, shadnagar, and shamshabad can be published in this release.",
    };
  }

  // Publishing sets lastReviewed — that timestamp is the review record for the CWA-29 gate.
  const lastReviewed = new Date();
  if (
    published &&
    !passesCwa29ServiceAreaQualityGate({
      lastReviewed,
      thinContent: thinContent ?? false,
    })
  ) {
    return {
      ok: false,
      error:
        "Cannot publish until thinContent is false (CWA-29 quality gate).",
    };
  }

  await prisma.serviceAreaPage.upsert({
    where: {
      serviceSlug_areaSlug: {
        serviceSlug,
        areaSlug,
      },
    },
    create: {
      serviceSlug,
      areaSlug,
      published,
      thinContent: thinContent ?? false,
      lastReviewed: published ? lastReviewed : null,
    },
    update: {
      published,
      thinContent: thinContent ?? false,
      lastReviewed: published ? lastReviewed : null,
    },
  });

  revalidateServiceAreaPage(serviceSlug, areaSlug);
  revalidatePath("/website-cms");
  return { ok: true };
}
