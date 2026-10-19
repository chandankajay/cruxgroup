import { describe, expect, it } from "vitest";
import {
  isFirstReleaseServiceAreaPair,
  serviceAreaPageIsPublic,
} from "./service-area-publish-gate";

describe("isFirstReleaseServiceAreaPair", () => {
  it("allows farmhouse-construction × launch areas", () => {
    expect(
      isFirstReleaseServiceAreaPair("farmhouse-construction", "shamshabad"),
    ).toBe(true);
  });

  it("rejects other services on launch areas", () => {
    expect(isFirstReleaseServiceAreaPair("land-levelling", "shamshabad")).toBe(
      false,
    );
  });

  it("rejects farmhouse on non-launch areas", () => {
    expect(
      isFirstReleaseServiceAreaPair("farmhouse-construction", "peddashapur"),
    ).toBe(false);
  });
});

describe("serviceAreaPageIsPublic", () => {
  const base = {
    serviceSlug: "farmhouse-construction",
    areaSlug: "shamshabad",
    published: true,
    lastReviewed: new Date(),
    thinContent: false,
  };

  it("is false when not a first-release pair", () => {
    expect(
      serviceAreaPageIsPublic({ ...base, serviceSlug: "land-levelling" }),
    ).toBe(false);
  });

  it("is false when thinContent", () => {
    expect(serviceAreaPageIsPublic({ ...base, thinContent: true })).toBe(false);
  });
});
