import { describe, expect, it } from "vitest";
import { createLeadSchema } from "./create-lead.js";

describe("createLeadSchema", () => {
  it("requires service fields for SERVICE leads", () => {
    const result = createLeadSchema.safeParse({
      name: "Test",
      phoneNumber: "9848012345",
      leadType: "SERVICE",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal SERVICE lead", () => {
    const result = createLeadSchema.safeParse({
      name: "Test",
      phoneNumber: "9848012345",
      leadType: "SERVICE",
      serviceSlug: "land-levelling",
      areaLabel: "Kothur",
    });
    expect(result.success).toBe(true);
  });
});
