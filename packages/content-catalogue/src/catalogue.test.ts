import { describe, expect, it } from "vitest";

import { catalogueDocumentSource } from "./catalogue.data";
import { catalogueDocumentSchema, imageKindSchema } from "./catalogue.schema";
import { collectCatalogueImageKeys } from "./collect-image-keys";

const PRICE_NOTE_SNIPPET = "exclude GST";

describe("catalogueDocumentSchema", () => {
  it("parses committed catalogue.data.ts", () => {
    const parsed = catalogueDocumentSchema.safeParse(catalogueDocumentSource);
    expect(parsed.success).toBe(true);
  });
});

describe("catalogue content rules", () => {
  const doc = catalogueDocumentSchema.parse(catalogueDocumentSource);

  it("exposes the approved GST price note", () => {
    expect(doc.catalogue.priceNote.en).toContain(PRICE_NOTE_SNIPPET);
    expect(doc.catalogue.priceNote.te).toContain("GST");
  });

  it("marks contact-for-quote items without prices", () => {
    const contactSlugs = [
      "earth-works",
      "fencing",
      "compound-wall",
      "building",
      "civil",
    ];
    for (const section of doc.sections) {
      for (const item of section.items) {
        if (contactSlugs.includes(item.slug)) {
          expect(item.contactForQuote).toBe(true);
          expect(item.prices).toHaveLength(0);
        }
      }
    }
  });

  it("applies approved rental and service prices", () => {
    const priced = new Map<string, string[]>();
    for (const section of doc.sections) {
      for (const item of section.items) {
        if (item.prices.length > 0) {
          priced.set(item.slug, item.prices.map((p) => p.text));
        }
      }
    }
    expect(priced.get("jcb")).toEqual(["Rs 1,200/hour"]);
    expect(priced.get("excavator")).toEqual(["From Rs 6,000/hour"]);
    expect(priced.get("hydra-crane")).toEqual(["From Rs 800/hour"]);
    expect(priced.get("dozer")).toEqual(["From Rs 1,200/hour"]);
    expect(priced.get("post-hole-digging")).toEqual(["From Rs 100 per hole"]);
    expect(priced.get("precast-handmade")).toEqual(["Rs 60/sft"]);
    expect(priced.get("precast-machine-made")).toEqual(["Rs 100/sft"]);
    expect(priced.get("farm-house")).toEqual(["Starting from Rs 1,400 per sft"]);
  });

  it("uses 30/50/20 milestone payment terms", () => {
    const milestone = doc.booklet.process.steps.find(
      (s) => s.paymentTerms !== undefined,
    );
    expect(milestone?.paymentTerms).toEqual({
      startPercent: 30,
      midPercent: 50,
      handoverPercent: 20,
    });
  });

  it("requires Telugu for every localized string and flags pending review", () => {
    const visit = (value: unknown): void => {
      if (value === null || typeof value !== "object") {
        return;
      }
      const record = value as Record<string, unknown>;
      if (typeof record.en === "string" && typeof record.te === "string") {
        expect(record.te.length).toBeGreaterThan(0);
        expect(record.teReviewed).toBe(false);
        return;
      }
      for (const child of Object.values(record)) {
        visit(child);
      }
    };
    visit(doc);
  });

  it("never types design or illustrative images as own", () => {
    const keys = collectCatalogueImageKeys(doc);
    for (const ref of keys) {
      const parsedKind = imageKindSchema.parse(ref.kind);
      if (parsedKind === "design" || parsedKind === "illus") {
        expect(ref.kind).not.toBe("own");
      }
    }
  });

  it("derives a stable sorted image key list for the CWA-57 manifest", () => {
    const keys = collectCatalogueImageKeys(doc).map((r) => r.key);
    const unique = [...new Set(keys)].sort();
    expect(unique.length).toBeGreaterThan(10);
    expect(unique).toContain("jcb");
    expect(unique).toContain("dozer");
  });
});

// CWA-57 will commit image-manifest.json validated with Zod and Blob URLs.
describe.skip("image manifest keys (CWA-57)", () => {
  it.todo("every catalogue image key exists in image-manifest.json");
});
