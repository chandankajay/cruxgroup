import { afterEach, describe, expect, it } from "vitest";
import {
  assertSafeServicesSeoSeedTarget,
  parseMongoDatabaseName,
  SEED_REFUSED_PROD_DB_NAME,
} from "./seed-services-seo-guard";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("parseMongoDatabaseName", () => {
  it("parses local and Atlas-style URLs", () => {
    expect(parseMongoDatabaseName("mongodb://127.0.0.1:27017/crux_dev")).toBe(
      "crux_dev",
    );
    expect(
      parseMongoDatabaseName(
        "mongodb+srv://user:pass@cluster.mongodb.net/crux_dev?retryWrites=true",
      ),
    ).toBe("crux_dev");
  });
});

describe("assertSafeServicesSeoSeedTarget", () => {
  it("allows dev when APP_ENV, SEED_ALLOWED_DB, and DB name match", () => {
    process.env.APP_ENV = "dev";
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/crux_dev";
    expect(() => assertSafeServicesSeoSeedTarget()).not.toThrow();
  });

  it("allows ci", () => {
    process.env.APP_ENV = "ci";
    process.env.SEED_ALLOWED_DB = "crux_ci";
    process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/crux_ci";
    expect(() => assertSafeServicesSeoSeedTarget()).not.toThrow();
  });

  it("aborts when APP_ENV is unset", () => {
    delete process.env.APP_ENV;
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/crux_dev";
    expect(() => assertSafeServicesSeoSeedTarget()).toThrow(/APP_ENV is required/);
  });

  it("aborts when APP_ENV is preview", () => {
    process.env.APP_ENV = "preview";
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/crux_dev";
    expect(() => assertSafeServicesSeoSeedTarget()).toThrow(/must be dev or ci/);
  });

  it("refuses production database name", () => {
    process.env.APP_ENV = "dev";
    process.env.SEED_ALLOWED_DB = SEED_REFUSED_PROD_DB_NAME;
    process.env.DATABASE_URL = `mongodb://host/${SEED_REFUSED_PROD_DB_NAME}`;
    expect(() => assertSafeServicesSeoSeedTarget()).toThrow(/production database/);
  });

  it("refuses when DB name does not match SEED_ALLOWED_DB", () => {
    process.env.APP_ENV = "dev";
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/other_db";
    expect(() => assertSafeServicesSeoSeedTarget()).toThrow(/does not match SEED_ALLOWED_DB/);
  });
});
