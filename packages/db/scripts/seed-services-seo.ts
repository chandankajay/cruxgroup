/**
 * Backfill ServicesArea rows from packages/lib clusters-data.json.
 * Run (dev DB only):
 *   APP_ENV=dev SEED_ALLOWED_DB=crux_dev DATABASE_URL=... pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
 */
import { prisma } from "../src/client";
import { assertSafeServicesSeoSeedTarget } from "../src/seed-services-seo-guard";
import clustersJson from "../../lib/src/data/clusters-data.json";
import type { ClustersData } from "../../lib/src/clusters.types";
import { straightLineKmFromC1Hub } from "../../lib/src/area-hub-distance";
import {
  FIRST_RELEASE_AREA_SLUGS,
  FIRST_RELEASE_SERVICE_SLUG,
  isFirstReleaseServiceAreaPair,
} from "../../lib/src/service-area-publish-gate";

const SERVICE_SLUGS = [
  "land-levelling",
  "earthworks-excavation",
  "precast-wall",
  "farmhouse-construction",
  "compound-fencing",
  "debris-rock-breaking",
] as const;

/**
 * Hub-to-hub road km from C1 — only set when measured (OSRM/manual) with a documented source.
 * Never derive from village.roadDistanceFromHubKm.
 */
const MEASURED_ROAD_KM_FROM_C1: Readonly<
  Record<string, { km: number; source: string }>
> = {};

const data = clustersJson as ClustersData;

async function main(): Promise<void> {
  assertSafeServicesSeoSeedTarget();

  for (const cluster of data.clusters) {
    const villages = data.villages.filter((v) => v.clusterId === cluster.id);
    const straightLineKm = straightLineKmFromC1Hub(cluster.hub.coordinates);
    const measured = MEASURED_ROAD_KM_FROM_C1[cluster.slug];

    await prisma.servicesArea.upsert({
      where: { slug: cluster.slug },
      create: {
        slug: cluster.slug,
        displayName: cluster.displayName,
        clusterId: cluster.id,
        roadKmFromBase: measured?.km ?? null,
        roadKmFromBaseSource: measured?.source ?? null,
        straightLineKmFromBase: straightLineKm,
        demandDrivers: [cluster.whyHere],
        villages: villages.slice(0, 50).map((v) => ({
          id: v.id,
          name: v.name,
          pincode: v.pincode,
        })),
        published: false,
      },
      update: {
        displayName: cluster.displayName,
        straightLineKmFromBase: straightLineKm,
        roadKmFromBase: measured?.km ?? null,
        roadKmFromBaseSource: measured?.source ?? null,
      },
    });
  }

  for (const slug of SERVICE_SLUGS) {
    await prisma.servicesSeoService.upsert({
      where: { slug },
      create: {
        slug,
        unitLabel: "See website",
        process_en: "Site visit → quotation → mobilisation → completion",
        published: true,
      },
      update: { published: true },
    });
  }

  for (const areaSlug of FIRST_RELEASE_AREA_SLUGS) {
    await prisma.serviceAreaPage.upsert({
      where: {
        serviceSlug_areaSlug: {
          serviceSlug: FIRST_RELEASE_SERVICE_SLUG,
          areaSlug,
        },
      },
      create: {
        serviceSlug: FIRST_RELEASE_SERVICE_SLUG,
        areaSlug,
        published: false,
        thinContent: true,
        lastReviewed: null,
      },
      update: {
        published: false,
      },
    });
  }

  const allPages = await prisma.serviceAreaPage.findMany({
    select: { serviceSlug: true, areaSlug: true },
  });
  for (const page of allPages) {
    if (isFirstReleaseServiceAreaPair(page.serviceSlug, page.areaSlug)) {
      continue;
    }
    await prisma.serviceAreaPage.update({
      where: {
        serviceSlug_areaSlug: {
          serviceSlug: page.serviceSlug,
          areaSlug: page.areaSlug,
        },
      },
      data: { published: false },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
