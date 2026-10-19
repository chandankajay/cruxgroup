const ALLOWED_APP_ENVS = new Set([
  "dev",
  "development",
  "preview",
  "ci",
  "test",
  "local",
]);

const PROD_DATABASE_URL_MARKERS = [
  "mongodb.net",
  "/crux_prod",
  "crux-prod",
  "production",
  "prod.cruxgroup",
];

/**
 * Refuses to run dev/preview seeds against production data (CWA-54).
 */
export function assertSafeServicesSeoSeedTarget(): void {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (appEnv === "prod" || appEnv === "production") {
    throw new Error(
      "seed-services-seo: APP_ENV is production — aborting to protect prod data.",
    );
  }
  if (appEnv && !ALLOWED_APP_ENVS.has(appEnv)) {
    throw new Error(
      `seed-services-seo: APP_ENV="${appEnv}" is not allowed for this seed (use dev/preview/ci).`,
    );
  }

  const databaseUrl = (process.env.DATABASE_URL ?? "").toLowerCase();
  if (!databaseUrl) {
    throw new Error("seed-services-seo: DATABASE_URL is required.");
  }

  for (const marker of PROD_DATABASE_URL_MARKERS) {
    if (databaseUrl.includes(marker)) {
      throw new Error(
        `seed-services-seo: DATABASE_URL looks like production (${marker}) — aborting.`,
      );
    }
  }
}
