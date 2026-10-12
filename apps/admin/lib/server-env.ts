import { z } from "zod";

const serverEnvSchema = z.object({
  CRUX_SERVICES_REVALIDATE_SECRET: z
    .string()
    .min(32, "CRUX_SERVICES_REVALIDATE_SECRET must be at least 32 characters"),
  CRUXGROUP_WEB_URL: z
    .string()
    .url("CRUXGROUP_WEB_URL must be a full URL (no production default)"),
});

export type AdminServerEnv = z.infer<typeof serverEnvSchema>;

export function getAdminServerEnv(): AdminServerEnv {
  return serverEnvSchema.parse({
    CRUX_SERVICES_REVALIDATE_SECRET:
      process.env.CRUX_SERVICES_REVALIDATE_SECRET?.trim(),
    CRUXGROUP_WEB_URL: process.env.CRUXGROUP_WEB_URL?.trim(),
  });
}
