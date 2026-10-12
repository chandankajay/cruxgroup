import { z } from "zod";

export const serviceLeadStageSchema = z.enum([
  "NEW",
  "SITE_VISIT_SCHEDULED",
  "SITE_VISIT_DONE",
  "QUOTATION_SENT",
  "QUOTE_ACCEPTED",
  "ADVANCE_RECEIVED",
  "COMPLETED",
  "LOST",
]);

export const updateServiceLeadStageSchema = z
  .object({
    leadId: z.string().min(1),
    stage: serviceLeadStageSchema,
    lostReason: z.string().trim().max(500).optional(),
  })
  .strict();

export const markQuotationSentSchema = z
  .object({
    leadId: z.string().min(1),
    amountPaise: z.number().int().positive(),
    sentAt: z.coerce.date(),
    billbookRef: z.string().trim().min(1).max(120),
  })
  .strict();

export const serviceLeadTypeSchema = z.enum(["SERVICE", "CUSTOMER", "FLEET_PARTNER"]);

export const serviceSlugSchema = z.string().trim().min(1).max(80);
