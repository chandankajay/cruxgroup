/** Production MongoDB database name — never seed against this. */
export const SEED_REFUSED_PROD_DB_NAME = "crux_prod";

const ALLOWED_APP_ENVS = new Set(["dev", "ci"]);

/**
 * Parses the database name from a MongoDB connection string without logging the URL.
 */
export function parseMongoDatabaseName(databaseUrl: string): string {
  const trimmed = databaseUrl.trim();
  if (!trimmed) return "";

  const withoutQuery = trimmed.split("?")[0] ?? trimmed;
  const slash = withoutQuery.lastIndexOf("/");
  if (slash === -1 || slash === withoutQuery.length - 1) {
    return "";
  }
  const name = withoutQuery.slice(slash + 1);
  return decodeURIComponent(name);
}

/**
 * Refuses to run dev seeds unless APP_ENV and DATABASE_URL target an explicit allow-list DB (CWA-54).
 */
export function assertSafeServicesSeoSeedTarget(): void {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (!appEnv) {
    throw new Error(
      "seed-services-seo: APP_ENV is required (set to dev or ci before running).",
    );
  }
  if (!ALLOWED_APP_ENVS.has(appEnv)) {
    throw new Error(
      `seed-services-seo: APP_ENV must be dev or ci (got "${appEnv}").`,
    );
  }

  const allowedDb = process.env.SEED_ALLOWED_DB?.trim();
  if (!allowedDb) {
    throw new Error(
      "seed-services-seo: SEED_ALLOWED_DB is required (target dev database name).",
    );
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (!databaseUrl) {
    throw new Error("seed-services-seo: DATABASE_URL is required.");
  }

  const dbName = parseMongoDatabaseName(databaseUrl);
  if (!dbName) {
    throw new Error(
      "seed-services-seo: could not parse database name from DATABASE_URL.",
    );
  }

  if (dbName === SEED_REFUSED_PROD_DB_NAME) {
    throw new Error(
      `seed-services-seo: refused to run against production database name "${SEED_REFUSED_PROD_DB_NAME}".`,
    );
  }

  if (dbName !== allowedDb) {
    throw new Error(
      `seed-services-seo: database name "${dbName}" does not match SEED_ALLOWED_DB.`,
    );
  }
}
