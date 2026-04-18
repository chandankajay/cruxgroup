import { z } from "zod";

export const partnerOnboardingSchema = z.object({
  companyName: z.string().trim().min(2, "Fleet / yard name must be at least 2 characters."),
  address: z.string().trim().min(10, "Enter a full primary yard address (at least 10 characters)."),
  baseLocation: z
    .string()
    .trim()
    .min(3, "Enter a city name or coordinates (e.g. 17.4065, 78.4772)."),
});

export type PartnerOnboardingValues = z.infer<typeof partnerOnboardingSchema>;
