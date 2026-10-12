/**
 * Backfill ServicesArea rows from packages/lib clusters-data.json.
 * Run: pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
 */
import { prisma } from "../src/client";
import { calculateDistanceKm, getClustersData, getHomeBaseHub } from "@repo/lib";

async function main(): Promise<void> {
  const data = getClustersData();
  const hub = getHomeBaseHub();

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
        straightLineKmFromBase: calculateStraight(cluster, hub),
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
        straightLineKmFromBase: calculateStraight(cluster, hub),
        published: cluster.isFirstBatch,
      },
    });
  }
}

function calculateStraight(
  cluster: { hub: { coordinates: { lat: number; lng: number } } },
  home: { hub: { coordinates: { lat: number; lng: number } } },
): number {
  return calculateDistanceKm(home.hub.coordinates, cluster.hub.coordinates);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
