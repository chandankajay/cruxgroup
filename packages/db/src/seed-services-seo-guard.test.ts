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
  it("returns empty when there is no database path", () => {
    expect(parseMongoDatabaseName("mongodb+srv://user:pass@host")).toBe("");
    expect(parseMongoDatabaseName("mongodb://user:pass@127.0.0.1:27017")).toBe(
      "",
    );
  });

  it("returns empty for query-only URLs without a path", () => {
    expect(
      parseMongoDatabaseName("mongodb+srv://user:pass@host?retryWrites=true"),
    ).toBe("");
  });

  it("parses multi-host URLs with auth", () => {
    expect(
      parseMongoDatabaseName("mongodb://u:p@h1,h2,h3/my_db?x=y"),
    ).toBe("my_db");
  });

  it("parses mongodb+srv with a database", () => {
    expect(
      parseMongoDatabaseName(
        "mongodb+srv://user:pass@cluster.mongodb.net/crux_dev?retryWrites=true",
      ),
    ).toBe("crux_dev");
  });

  it("parses a simple local URL", () => {
    expect(parseMongoDatabaseName("mongodb://127.0.0.1:27017/crux_dev")).toBe(
      "crux_dev",
    );
  });

  it("never returns authority segments", () => {
    const name = parseMongoDatabaseName("mongodb+srv://user:pass@host");
    expect(name).not.toContain("@");
    expect(name).not.toContain("pass");
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

  it("refuses when DB name does not match SEED_ALLOWED_DB without leaking credentials", () => {
    process.env.APP_ENV = "dev";
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL =
      "mongodb+srv://user:secret@cluster.mongodb.net/other_db";
    let message = "";
    try {
      assertSafeServicesSeoSeedTarget();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/does not match SEED_ALLOWED_DB/);
    expect(message).not.toContain("@");
    expect(message).not.toContain("secret");
    expect(message).not.toContain("user");
  });

  it("does not leak authority when URL has no database path", () => {
    process.env.APP_ENV = "dev";
    process.env.SEED_ALLOWED_DB = "crux_dev";
    process.env.DATABASE_URL = "mongodb+srv://user:secret@host";
    let message = "";
    try {
      assertSafeServicesSeoSeedTarget();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/could not parse database name/);
    expect(message).not.toContain("@");
    expect(message).not.toContain("secret");
  });
});
