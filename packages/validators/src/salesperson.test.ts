import { describe, expect, it } from "vitest";
import { upsertSalespersonSchema } from "./salesperson.js";

describe("upsertSalespersonSchema", () => {
  it("rejects unknown keys", () => {
    const result = upsertSalespersonSchema.safeParse({
      name: "A",
      phoneNumber: "9876543210",
      canSendQuotes: false,
      isActive: true,
      assignedAreaSlugs: [],
      extra: true,
    });
    expect(result.success).toBe(false);
  });
});
