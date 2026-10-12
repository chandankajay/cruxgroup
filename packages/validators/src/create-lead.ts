import { z } from "zod";
import { serviceLeadTypeSchema, serviceSlugSchema } from "./service-lead-stage.js";

export const createLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    phoneNumber: z.string().trim().min(10).max(20),
    leadType: serviceLeadTypeSchema,
    source: z.string().trim().max(120).optional(),
    serviceSlug: serviceSlugSchema.optional(),
    areaLabel: z.string().trim().max(200).optional(),
    landSize: z.string().trim().max(80).optional(),
    timeline: z.string().trim().max(80).optional(),
    landType: z.string().trim().max(80).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.leadType !== "SERVICE") return;
    if (!data.serviceSlug?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Service is required for site service leads.",
        path: ["serviceSlug"],
      });
    }
    if (!data.areaLabel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Area or village is required for site service leads.",
        path: ["areaLabel"],
      });
    }
  });

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
