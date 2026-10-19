import { z } from "zod";

/** User-facing copy in English and Telugu. Telugu strings are pending reader review unless teReviewed is true. */
export const localizedStringSchema = z.object({
  en: z.string().min(1),
  te: z.string().min(1),
  teReviewed: z.boolean().optional(),
});

export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const imageKindSchema = z.enum(["own", "design", "illus"]);

export const imageRefSchema = z.object({
  key: z.string().min(1),
  kind: imageKindSchema,
});

export type ImageRef = z.infer<typeof imageRefSchema>;

export const priceEntrySchema = z.object({
  text: z.string().min(1),
});

export const paymentTermsSchema = z.object({
  startPercent: z.literal(30),
  midPercent: z.literal(50),
  handoverPercent: z.literal(20),
});

export type PaymentTerms = z.infer<typeof paymentTermsSchema>;

export const companySchema = z.object({
  legalName: z.string().min(1),
  brand: localizedStringSchema,
  tagline: localizedStringSchema,
  address: localizedStringSchema,
  gstin: z.string().min(1),
  phone: z.string().min(1),
  phoneDisplay: z.string().min(1),
  email: z.string().email(),
  website: z.string().url(),
  websiteDisplay: z.string().min(1),
});

export const catalogueMetaSchema = z.object({
  title: localizedStringSchema,
  priceNote: localizedStringSchema,
});

export const catalogueItemSchema = z.object({
  slug: z.string().min(1),
  name: localizedStringSchema,
  description: localizedStringSchema,
  bestUse: z.array(localizedStringSchema).optional(),
  prices: z.array(priceEntrySchema),
  contactForQuote: z.boolean(),
  image: imageRefSchema,
});

export type CatalogueItem = z.infer<typeof catalogueItemSchema>;

export const catalogueSectionSchema = z.object({
  id: z.enum(["rentals", "services"]),
  title: localizedStringSchema,
  items: z.array(catalogueItemSchema).min(1),
});

export const designOptionSchema = z.object({
  slug: z.string().min(1),
  name: localizedStringSchema,
  description: localizedStringSchema,
  image: imageRefSchema,
});

export const processStepSchema = z.object({
  heading: localizedStringSchema,
  body: localizedStringSchema,
  paymentTerms: paymentTermsSchema.optional(),
});

export const bookletAboutSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  body: z.array(localizedStringSchema).min(1),
  points: z.array(
    z.object({
      heading: localizedStringSchema,
      text: localizedStringSchema,
    }),
  ),
  image: imageRefSchema,
});

export const bookletEarthworksSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  image: imageRefSchema,
  imageSecondary: imageRefSchema,
  process: z.array(
    z.object({
      heading: localizedStringSchema,
      text: localizedStringSchema,
    }),
  ),
});

export const bookletPrecastSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  handmadeImage: imageRefSchema,
  machineImage: imageRefSchema,
  comparisonRows: z.array(z.array(localizedStringSchema)),
  note: localizedStringSchema,
});

export const bookletFencingSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  ownImage: imageRefSchema,
  options: z.array(designOptionSchema),
});

export const bookletBuildingSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  image: imageRefSchema,
  blocks: z.array(
    z.object({
      heading: localizedStringSchema,
      text: localizedStringSchema,
    }),
  ),
});

export const designOptionsSectionSchema = z.object({
  heading: localizedStringSchema,
  lead: localizedStringSchema,
  options: z.array(designOptionSchema).min(1),
});

export const bookletSchema = z.object({
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
  process: z.object({
    heading: localizedStringSchema,
    steps: z.array(processStepSchema).min(1),
  }),
});

export const catalogueDocumentSchema = z.object({
  company: companySchema,
  catalogue: catalogueMetaSchema,
  sections: z.array(catalogueSectionSchema).min(1),
  booklet: bookletSchema,
  imageBadgeLabels: z.object({
    own: localizedStringSchema,
    design: localizedStringSchema,
    illus: localizedStringSchema,
  }),
});

export type CatalogueDocument = z.infer<typeof catalogueDocumentSchema>;
