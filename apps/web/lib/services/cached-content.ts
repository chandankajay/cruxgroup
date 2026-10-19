import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@repo/db";
import {
  projectsForSpokeTag,
  projectsListTag,
  serviceAreaPageTag,
  serviceAreaPagesListTag,
} from "@repo/lib";
import {
  isFirstReleaseServiceAreaPair,
  serviceAreaPageIsPublic,
} from "@repo/lib/service-area-publish-gate";

export async function getPublishedServiceAreaPageTagged(
  serviceSlug: string,
  areaSlug: string,
) {
  const tagged = unstable_cache(
    async () => {
      return prisma.serviceAreaPage.findUnique({
        where: { serviceSlug_areaSlug: { serviceSlug, areaSlug } },
        include: { area: true, service: true },
      });
    },
    ["service-area-page", serviceSlug, areaSlug],
    {
      revalidate: 86400,
      tags: [serviceAreaPageTag(serviceSlug, areaSlug), serviceAreaPagesListTag()],
    },
  );
  return tagged();
}

export async function getPublishedSpokeProjects(serviceSlug: string, areaSlug: string) {
  const tagged = unstable_cache(
    async () => {
      return prisma.servicesProject.findMany({
        where: {
          published: true,
          serviceSlug,
          areaSlug,
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          villageLabel: true,
          sizeLabel: true,
          photos: true,
          testimonial: true,
        },
      });
    },
    ["spoke-projects", serviceSlug, areaSlug],
    {
      revalidate: 86400,
      tags: [projectsForSpokeTag(serviceSlug, areaSlug), projectsListTag()],
    },
  );
  return tagged();
}

const getPublishedProjectsListCached = unstable_cache(
  async () => {
    return prisma.servicesProject.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        serviceSlug: true,
        areaSlug: true,
        villageLabel: true,
        sizeLabel: true,
        photos: true,
        testimonial: true,
        completedAt: true,
      },
    });
  },
  ["projects-list"],
  { revalidate: 3600, tags: [projectsListTag()] },
);

export async function getPublishedProjectsList() {
  return getPublishedProjectsListCached();
}

export async function listPublishedServiceAreaPageParams(): Promise<
  { serviceSlug: string; areaSlug: string }[]
> {
  const tagged = unstable_cache(
    async () => {
      const rows = await prisma.serviceAreaPage.findMany({
        where: {
          published: true,
          thinContent: false,
          lastReviewed: { not: null },
        },
        take: 500,
        select: {
          serviceSlug: true,
          areaSlug: true,
          published: true,
          thinContent: true,
          lastReviewed: true,
        },
      });
      return rows
        .filter((row) =>
          isFirstReleaseServiceAreaPair(row.serviceSlug, row.areaSlug),
        )
        .filter((row) => serviceAreaPageIsPublic(row))
        .map(({ serviceSlug, areaSlug }) => ({ serviceSlug, areaSlug }));
    },
    ["service-area-page-params"],
    { revalidate: 3600, tags: [serviceAreaPagesListTag()] },
  );
  return tagged();
}
