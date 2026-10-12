import { describe, expect, it } from "vitest";
import { SERVICE_CATALOG_SLUGS } from "./service-leads";

describe("SERVICE_CATALOG_SLUGS", () => {
  it("lists six canonical site services (CWA-25)", () => {
    expect(SERVICE_CATALOG_SLUGS).toHaveLength(6);
    expect(SERVICE_CATALOG_SLUGS).toContain("land-levelling");
    expect(SERVICE_CATALOG_SLUGS).toContain("debris-rock-breaking");
  });
});
