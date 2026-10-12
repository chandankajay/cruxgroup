import { z } from "zod";

export const serviceQuoteRequestSchema = z
  .object({
    serviceSlug: z.string().min(1),
    villageId: z.string().min(1),
    landSize: z.string().min(1).max(80),
    timeline: z.string().min(1).max(80),
    landType: z.string().max(80).optional(),
    name: z.string().min(2).max(120),
    phone: z.string().min(10).max(15),
    whatsappOptIn: z.boolean(),
    photoUrls: z.array(z.string().url()).max(5).optional(),
  })
  .strict();

export type ServiceQuoteRequestInput = z.infer<typeof serviceQuoteRequestSchema>;
