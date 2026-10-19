import { z } from "zod";
import { serviceSlugSchema } from "./service-lead-stage.js";

export const setServiceAreaPagePublishedSchema = z
  .object({
    serviceSlug: serviceSlugSchema,
    areaSlug: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "Invalid area slug"),
    published: z.boolean(),
    thinContent: z.boolean().optional(),
  })
  .strict();

export type SetServiceAreaPagePublishedInput = z.infer<
  typeof setServiceAreaPagePublishedSchema
>;
