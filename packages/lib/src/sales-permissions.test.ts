import { describe, expect, it } from "vitest";
import { assertSalesRoleSelectable, canMarkQuotationSent } from "./sales-permissions";

describe("canMarkQuotationSent", () => {
  it("allows admin regardless of flags", () => {
    expect(
      canMarkQuotationSent("ADMIN", { canSendQuotes: false, isActive: true }),
    ).toBe(true);
  });

  it("denies sales without permission", () => {
    expect(
      canMarkQuotationSent("SALES", { canSendQuotes: false, isActive: true }),
    ).toBe(false);
  });

  it("allows active sales with permission", () => {
    expect(
      canMarkQuotationSent("SALES", { canSendQuotes: true, isActive: true }),
    ).toBe(true);
  });

  it("denies inactive sales", () => {
    expect(
      canMarkQuotationSent("SALES", { canSendQuotes: true, isActive: false }),
    ).toBe(false);
  });
});

describe("assertSalesRoleSelectable", () => {
  it("rejects SALES self-selection", () => {
    expect(() => assertSalesRoleSelectable("SALES")).toThrow();
  });

  it("allows PARTNER", () => {
    expect(assertSalesRoleSelectable("PARTNER")).toBe("PARTNER");
  });
});
