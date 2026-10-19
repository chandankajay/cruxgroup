import { describe, expect, it } from "vitest";

import {
  BANNED_EN_PHRASES,
  BANNED_TE_PHRASES,
  collectLocalizedEnStrings,
  collectLocalizedTeStrings,
  teTextContainsBannedPhrase,
} from "./banned-claim-phrases";
import { catalogueDocumentSource } from "./catalogue.data";
import { catalogueDocumentSchema } from "./catalogue.schema";
import { collectCatalogueImageKeys } from "./collect-image-keys";

const PRICE_NOTE_SNIPPET = "exclude GST";

describe("catalogueDocumentSchema", () => {
  it("parses committed catalogue.data.ts", () => {
    const parsed = catalogueDocumentSchema.safeParse(catalogueDocumentSource);
    expect(parsed.success).toBe(true);
  });

  it("rejects an own image key outside the allow-list", () => {
    const tampered = JSON.parse(JSON.stringify(catalogueDocumentSource)) as {
      sections: { items: { image: { key: string; kind: string } }[] }[];
    };
    const firstItem = tampered.sections[0]?.items[0];
    expect(firstItem).toBeDefined();
    if (!firstItem) {
      return;
    }
    firstItem.image = { key: "dozer", kind: "own" };
    const parsed = catalogueDocumentSchema.safeParse(tampered);
    expect(parsed.success).toBe(false);
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

  it("requires Telugu for every localized string and allows teReviewed true after review", () => {
    const visit = (value: unknown): void => {
      if (value === null || typeof value !== "object") {
        return;
      }
      const record = value as Record<string, unknown>;
      if (typeof record.en === "string" && typeof record.te === "string") {
        expect(record.te.length).toBeGreaterThan(0);
        if (record.teReviewed !== undefined) {
          expect(record.teReviewed === true || record.teReviewed === false).toBe(true);
        }
        return;
      }
      for (const child of Object.values(record)) {
        visit(child);
      }
    };
    visit(doc);
  });

  it("types farm, wall and fence design galleries as design (never own)", () => {
    for (const opt of doc.booklet.farmHouseDesigns.options) {
      expect(opt.image.kind).toBe("design");
    }
    for (const opt of doc.booklet.wallDesigns.options) {
      expect(opt.image.kind).toBe("design");
    }
    for (const opt of doc.booklet.fencing.options) {
      expect(opt.image.kind).toBe("design");
    }
  });

  it("contains no banned claim phrases in English copy (brief §5)", () => {
    const enStrings = collectLocalizedEnStrings(doc);
    for (const text of enStrings) {
      const lower = text.toLowerCase();
      for (const phrase of BANNED_EN_PHRASES) {
        expect(lower).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it("contains no banned claim phrases in Telugu copy (brief §5)", () => {
    const teStrings = collectLocalizedTeStrings(doc);
    for (const text of teStrings) {
      expect(teTextContainsBannedPhrase(text)).toBe(false);
    }
  });

  it("still catches Telugu banned phrases when ZWNJ is inserted", () => {
    const withZwnj = `ధృవీకరించి${"\u200C"}న ఆపరేటర్`;
    expect(teTextContainsBannedPhrase(withZwnj)).toBe(true);
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
