import { z } from "zod";
import { normalizeWhatsAppDestination } from "@repo/lib/aisensy";

const phoneDigits = z
  .string()
  .trim()
  .min(10, "Phone number is too short.")
  .max(20, "Phone number is too long.")
  .refine((value) => {
    const normalized = normalizeWhatsAppDestination(value);
    const digits = normalized.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Enter a valid mobile number.");

export const sendInvoiceWhatsAppBodySchema = z.object({
  destinationPhone: phoneDigits.optional(),
});

export type SendInvoiceWhatsAppBody = z.infer<typeof sendInvoiceWhatsAppBodySchema>;
