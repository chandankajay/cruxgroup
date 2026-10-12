/**
 * Backfill ServicesArea rows from packages/lib clusters-data.json.
 * Run: pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
 */
import { prisma } from "../src/client";
import { calculateDistanceKm } from "../../lib/src/geo";
import clustersJson from "../../lib/src/data/clusters-data.json";
import type { ClustersData } from "../../lib/src/clusters.types";

const SERVICE_SLUGS = [
  "land-levelling",
  "earthworks-excavation",
  "precast-wall",
  "farmhouse-construction",
  "compound-fencing",
  "debris-rock-breaking",
] as const;

const data = clustersJson as ClustersData;

async function main(): Promise<void> {
  const hub = data.clusters.find((c) => c.isHomeBase);
  if (!hub) throw new Error("Home base cluster missing");

  for (const cluster of data.clusters) {
    const villages = data.villages.filter((v) => v.clusterId === cluster.id);
    const roadKm =
      villages.reduce((min, v) => Math.min(min, v.roadDistanceFromHubKm), Infinity) ||
      cluster.maxServiceRadiusKm;

    await prisma.servicesArea.upsert({
      where: { slug: cluster.slug },
      create: {
        slug: cluster.slug,
        displayName: cluster.displayName,
        clusterId: cluster.id,
        roadKmFromBase: roadKm,
        straightLineKmFromBase: calculateDistanceKm(
          hub.hub.coordinates,
          cluster.hub.coordinates,
        ),
        demandDrivers: [cluster.whyHere],
        villages: villages.slice(0, 50).map((v) => ({
          id: v.id,
          name: v.name,
          pincode: v.pincode,
        })),
        published: cluster.isFirstBatch,
      },
      update: {
        displayName: cluster.displayName,
        roadKmFromBase: roadKm,
        straightLineKmFromBase: calculateDistanceKm(
          hub.hub.coordinates,
          cluster.hub.coordinates,
        ),
        published: cluster.isFirstBatch,
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

  const firstBatch = data.clusters.filter((c) => c.isFirstBatch);
  for (const cluster of firstBatch) {
    for (const serviceSlug of SERVICE_SLUGS) {
      await prisma.serviceAreaPage.upsert({
        where: {
          serviceSlug_areaSlug: { serviceSlug, areaSlug: cluster.slug },
        },
        create: {
          serviceSlug,
          areaSlug: cluster.slug,
          published: true,
          thinContent: false,
          lastReviewed: new Date(),
        },
        update: {
          published: true,
          thinContent: false,
          lastReviewed: new Date(),
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
