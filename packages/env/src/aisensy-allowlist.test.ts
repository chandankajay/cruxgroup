import { afterEach, describe, expect, it } from "vitest";
import { isAisensyDestinationAllowed } from "./aisensy-allowlist";

describe("isAisensyDestinationAllowed", () => {
  const prev = process.env;

  afterEach(() => {
    process.env = { ...prev };
  });

  it("blocks non-allowlisted numbers outside prod", () => {
    process.env["APP_ENV"] = "dev";
    process.env["AISENSY_TEST_ALLOWLIST"] = "919876543210";
    expect(isAisensyDestinationAllowed("+919876543210")).toBe(true);
    expect(isAisensyDestinationAllowed("+919111111111")).toBe(false);
  });
});
