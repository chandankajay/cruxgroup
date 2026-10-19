import { z } from "zod";

import {
  validateCatalogueImageRef,
  validateDesignOptionImage,
} from "./catalogue-image-rules";

/** Indian GSTIN (15 characters). */
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** User-facing copy in English and Telugu. Telugu strings are pending reader review unless teReviewed is true. */
export const localizedStringSchema = z
  .object({
    en: z.string().min(1),
    te: z.string().min(1),
    teReviewed: z.boolean().optional(),
  })
  .strict();

export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const imageKindSchema = z.enum(["own", "design", "illus"]);

export const imageRefSchema = z
  .object({
    key: z.string().min(1),
    kind: imageKindSchema,
  })
  .strict()
  .superRefine((ref, ctx) => {
    validateCatalogueImageRef(ref, ctx);
  });

export type ImageRef = z.infer<typeof imageRefSchema>;

export const priceEntrySchema = z
  .object({
    text: z.string().min(1),
  })
  .strict();

export const paymentTermsSchema = z
  .object({
    startPercent: z.literal(30),
    midPercent: z.literal(50),
    handoverPercent: z.literal(20),
  })
  .strict();

export type PaymentTerms = z.infer<typeof paymentTermsSchema>;

export const companySchema = z
  .object({
    legalName: z.string().min(1),
    brand: localizedStringSchema,
    tagline: localizedStringSchema,
    address: localizedStringSchema,
    gstin: z.string().regex(GSTIN_REGEX, "Invalid GSTIN format"),
    phone: z.string().min(1),
    phoneDisplay: z.string().min(1),
    email: z.string().email(),
    website: z.string().url(),
    websiteDisplay: z.string().min(1),
  })
  .strict();

export const catalogueMetaSchema = z
  .object({
    title: localizedStringSchema,
    priceNote: localizedStringSchema,
  })
  .strict();

export const catalogueItemSchema = z
  .object({
    slug: z.string().min(1),
    name: localizedStringSchema,
    description: localizedStringSchema,
    bestUse: z.array(localizedStringSchema).optional(),
    prices: z.array(priceEntrySchema),
    contactForQuote: z.boolean(),
    image: imageRefSchema,
  })
  .strict();

export type CatalogueItem = z.infer<typeof catalogueItemSchema>;

export const catalogueSectionSchema = z
  .object({
    id: z.enum(["rentals", "services"]),
    title: localizedStringSchema,
    items: z.array(catalogueItemSchema).min(1),
  })
  .strict();

export const designOptionSchema = z
  .object({
    slug: z.string().min(1),
    name: localizedStringSchema,
    description: localizedStringSchema,
    image: imageRefSchema,
  })
  .strict()
  .superRefine((option, ctx) => {
    validateDesignOptionImage(option.image, ctx, []);
  });

export const processStepSchema = z
  .object({
    heading: localizedStringSchema,
    body: localizedStringSchema,
    paymentTerms: paymentTermsSchema.optional(),
  })
  .strict();

export const bookletAboutSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    body: z.array(localizedStringSchema).min(1),
    points: z.array(
      z
        .object({
          heading: localizedStringSchema,
          text: localizedStringSchema,
        })
        .strict(),
    ),
    image: imageRefSchema,
  })
  .strict();

export const bookletEarthworksSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    image: imageRefSchema,
    imageSecondary: imageRefSchema,
    process: z.array(
      z
        .object({
          heading: localizedStringSchema,
          text: localizedStringSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const bookletPrecastSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    handmadeImage: imageRefSchema,
    machineImage: imageRefSchema,
    comparisonRows: z.array(z.array(localizedStringSchema)),
    note: localizedStringSchema,
  })
  .strict();

export const bookletFencingSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    ownImage: imageRefSchema,
    options: z.array(designOptionSchema),
  })
  .strict();

export const bookletBuildingSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    image: imageRefSchema,
    blocks: z.array(
      z
        .object({
          heading: localizedStringSchema,
          text: localizedStringSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const designOptionsSectionSchema = z
  .object({
    heading: localizedStringSchema,
    lead: localizedStringSchema,
    options: z.array(designOptionSchema).min(1),
  })
  .strict();

export const bookletSchema = z
  .object({
    title: localizedStringSchema,
    subtitle: localizedStringSchema,
    coverImage: imageRefSchema,
    designSectionLabel: localizedStringSchema,
    about: bookletAboutSchema,
    earthworks: bookletEarthworksSchema,
    precast: bookletPrecastSchema,
    wallDesigns: designOptionsSectionSchema,
    farmHouseDesigns: designOptionsSectionSchema,
    fencing: bookletFencingSchema,
    building: bookletBuildingSchema,
    process: z
      .object({
        heading: localizedStringSchema,
        steps: z.array(processStepSchema).min(1),
      })
      .strict(),
  })
  .strict();

export const catalogueDocumentSchema = z
  .object({
    company: companySchema,
    catalogue: catalogueMetaSchema,
    sections: z.array(catalogueSectionSchema).min(1),
    booklet: bookletSchema,
    imageBadgeLabels: z
      .object({
        own: localizedStringSchema,
        design: localizedStringSchema,
        illus: localizedStringSchema,
      })
      .strict(),
  })
  .strict();

export type CatalogueDocument = z.infer<typeof catalogueDocumentSchema>;
