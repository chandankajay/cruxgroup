import { afterEach, describe, expect, it, vi } from "vitest";
import { parseAppEnv, shouldNoIndex } from "./app-env";

describe("parseAppEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts dev and prod", () => {
    expect(parseAppEnv("dev")).toBe("dev");
    expect(parseAppEnv("prod")).toBe("prod");
  });

  it("flags non-prod for noindex", () => {
    expect(shouldNoIndex("dev")).toBe(true);
    expect(shouldNoIndex("prod")).toBe(false);
  });

  it("defaults locally when APP_ENV is unset (not on Vercel)", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("CI", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(parseAppEnv(undefined)).toBe("dev");
  });

  it("uses ci when CI=true locally", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("CI", "true");
    expect(parseAppEnv(undefined)).toBe("ci");
  });

  it("throws on Vercel when APP_ENV is missing", () => {
    vi.stubEnv("VERCEL", "1");
    expect(() => parseAppEnv(undefined)).toThrow(/must be set on Vercel/);
  });

  it("throws on Vercel when APP_ENV is invalid", () => {
    vi.stubEnv("VERCEL", "1");
    expect(() => parseAppEnv("staging")).toThrow(/must be dev, prod, or ci/);
  });

  it("does not default to prod on Vercel when NODE_ENV is production", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => parseAppEnv(undefined)).toThrow(/must be set on Vercel/);
  });

  it("accepts explicit APP_ENV on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(parseAppEnv("dev")).toBe("dev");
    expect(parseAppEnv("prod")).toBe("prod");
  });
});
