import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getAuthSecret } from "./auth-secret";

describe("getAuthSecret", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env["NEXTAUTH_SECRET"];
    delete process.env["AUTH_SECRET"];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws at runtime when the secret is missing", () => {
    expect(() => getAuthSecret()).toThrow(/AUTH_SECRET|NEXTAUTH_SECRET/);
  });

  it("returns AUTH_SECRET when set", () => {
    process.env["AUTH_SECRET"] = "auth-secret-from-auth-env-var-xxxxxx";
    expect(getAuthSecret()).toBe("auth-secret-from-auth-env-var-xxxxxx");
  });

  it("uses NEXTAUTH_SECRET when AUTH_SECRET is unset", () => {
    process.env["NEXTAUTH_SECRET"] = "ci-auth-secret-min-32-chars-long-xxxx";
    expect(getAuthSecret()).toBe("ci-auth-secret-min-32-chars-long-xxxx");
  });

  it("prefers AUTH_SECRET over NEXTAUTH_SECRET when both are set", () => {
    process.env["AUTH_SECRET"] = "preferred-auth-secret-value-xxxxxx";
    process.env["NEXTAUTH_SECRET"] = "secondary-nextauth-secret-xxxxxx";
    expect(getAuthSecret()).toBe("preferred-auth-secret-value-xxxxxx");
  });
});
