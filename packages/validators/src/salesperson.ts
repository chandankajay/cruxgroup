import { z } from "zod";

/** Admin upsert payload for `/salespeople` (CWA-53). */
export const upsertSalespersonSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    phoneNumber: z.string().trim().min(10).max(20),
    canSendQuotes: z.boolean(),
    isActive: z.boolean(),
    assignedAreaSlugs: z.array(z.string().trim().min(1).max(80)).max(50),
  })
  .strict();

export type UpsertSalespersonInput = z.infer<typeof upsertSalespersonSchema>;
