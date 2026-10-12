import { describe, expect, it } from "vitest";
import { serviceQuoteRequestSchema } from "./service-quote.js";

describe("serviceQuoteRequestSchema", () => {
  it("rejects unknown keys (strict)", () => {
    const result = serviceQuoteRequestSchema.safeParse({
      serviceSlug: "land-levelling",
      villageId: "v1",
      landSize: "2 acres",
      timeline: "Within 2 weeks",
      name: "Test User",
      phone: "9876543210",
      whatsappOptIn: true,
      extra: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid payload", () => {
    const result = serviceQuoteRequestSchema.safeParse({
      serviceSlug: "land-levelling",
      villageId: "v1",
      landSize: "2 acres",
      timeline: "Within 2 weeks",
      name: "Test User",
      phone: "9876543210",
      whatsappOptIn: true,
    });
    expect(result.success).toBe(true);
  });
});
