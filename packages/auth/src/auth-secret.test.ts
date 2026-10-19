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
    expect(() => getAuthSecret()).toThrow(
      /NEXTAUTH_SECRET|AUTH_SECRET/,
    );
  });

  it("returns NEXTAUTH_SECRET when set", () => {
    process.env["NEXTAUTH_SECRET"] = "ci-auth-secret-min-32-chars-long-xxxx";
    expect(getAuthSecret()).toBe("ci-auth-secret-min-32-chars-long-xxxx");
  });

  it("uses AUTH_SECRET when NEXTAUTH_SECRET is unset", () => {
    process.env["AUTH_SECRET"] = "auth-secret-from-auth-env-var-xxxxxx";
    expect(getAuthSecret()).toBe("auth-secret-from-auth-env-var-xxxxxx");
  });
});
