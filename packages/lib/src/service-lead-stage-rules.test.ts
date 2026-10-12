import { describe, expect, it } from "vitest";
import { canSalesMoveToStage } from "./service-lead-stage-rules";

describe("canSalesMoveToStage", () => {
  it("blocks QUOTATION_SENT for everyone via stage dropdown", () => {
    expect(canSalesMoveToStage("QUOTATION_SENT", true).ok).toBe(false);
    expect(canSalesMoveToStage("QUOTATION_SENT", false).ok).toBe(false);
  });

  it("blocks post-quotation stages when canSendQuotes is false", () => {
    expect(canSalesMoveToStage("QUOTE_ACCEPTED", false).ok).toBe(false);
    expect(canSalesMoveToStage("SITE_VISIT_DONE", false).ok).toBe(true);
  });

  it("allows post-quotation stages when canSendQuotes is true (except QUOTATION_SENT)", () => {
    expect(canSalesMoveToStage("QUOTE_ACCEPTED", true).ok).toBe(true);
  });
});
