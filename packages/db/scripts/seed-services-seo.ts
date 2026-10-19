/**
 * Backfill ServicesArea rows from packages/lib clusters-data.json.
 * Run (dev DB only): pnpm --filter @repo/db exec tsx scripts/seed-services-seo.ts
 */
import { prisma } from "../src/client";
import { assertSafeServicesSeoSeedTarget } from "../src/seed-services-seo-guard";
import clustersJson from "../../lib/src/data/clusters-data.json";
import type { ClustersData } from "../../lib/src/clusters.types";
import { straightLineKmFromC1Hub } from "../../lib/src/area-hub-distance";

const SERVICE_SLUGS = [
  "land-levelling",
  "earthworks-excavation",
  "precast-wall",
  "farmhouse-construction",
  "compound-fencing",
  "debris-rock-breaking",
] as const;

/** First public release (CWA-54): only these area × service pairs may be reviewed/published. */
const FIRST_RELEASE_AREA_SLUGS = new Set([
  "fatimapur-kothur",
  "shadnagar",
  "shamshabad",
]);

const FIRST_RELEASE_SERVICE_SLUG = "farmhouse-construction";

/**
 * Hub-to-hub road km from C1 — only set when measured (OSRM/manual) with a documented source.
 * Never derive from village.roadDistanceFromHubKm.
 */
const MEASURED_ROAD_KM_FROM_C1: Readonly<
  Record<string, { km: number; source: string }>
> = {};

const data = clustersJson as ClustersData;

function areaDisplayName(slug: string, fallback: string): string {
  if (slug === "fatimapur-kothur") return "Fathimapur (Kothur)";
  return fallback;
}

async function main(): Promise<void> {
  assertSafeServicesSeoSeedTarget();

  for (const cluster of data.clusters) {
    const villages = data.villages.filter((v) => v.clusterId === cluster.id);
    const straightLineKm = straightLineKmFromC1Hub(cluster.hub.coordinates);
    const measuredRoad = MEASURED_ROAD_KM_FROM_C1[cluster.slug];

    await prisma.servicesArea.upsert({
      where: { slug: cluster.slug },
      create: {
        slug: cluster.slug,
        displayName: areaDisplayName(cluster.slug, cluster.displayName),
        clusterId: cluster.id,
        roadKmFromBase: measuredRoad?.km ?? null,
        roadKmFromBaseSource: measuredRoad?.source ?? null,
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
        displayName: areaDisplayName(cluster.slug, cluster.displayName),
        straightLineKmFromBase: straightLineKm,
        ...(measuredRoad
          ? {
              roadKmFromBase: measuredRoad.km,
              roadKmFromBaseSource: measuredRoad.source,
            }
          : {}),
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
      update: {},
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
