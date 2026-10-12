import { z } from "zod";
import { isPublicVercelBlobUrl } from "@repo/validators/service-quote";
import { serviceSlugSchema } from "@repo/validators/service-lead-stage";

const publicVercelBlobUrlSchema = z
  .string()
  .url()
  .refine(isPublicVercelBlobUrl, {
    message: "Photo must be hosted on Vercel Blob (public store).",
  });

export const projectPhotoSchema = z
  .object({
    url: publicVercelBlobUrlSchema,
    alt: z.string().trim().min(1).max(200),
    order: z.number().int().min(0),
  })
  .strict();

export const upsertWebsiteProjectSchema = z
  .object({
    id: z.string().min(1).optional(),
    title: z.string().trim().min(1).max(160),
    serviceSlug: serviceSlugSchema,
    areaSlug: z.string().trim().max(80).optional(),
    villageLabel: z.string().trim().max(120).optional(),
    sizeLabel: z.string().trim().max(80).optional(),
    testimonial: z.string().trim().max(2000).optional(),
    published: z.boolean(),
    photos: z.array(projectPhotoSchema).min(1).max(12),
    startedAt: z.string().trim().max(40).optional(),
    completedAt: z.string().trim().max(40).optional(),
  })
  .strict();

export type UpsertWebsiteProjectInput = z.infer<typeof upsertWebsiteProjectSchema>;
