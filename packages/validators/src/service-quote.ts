import { z } from "zod";

const PUBLIC_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isPublicVercelBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host.endsWith(PUBLIC_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

const publicVercelBlobUrlSchema = z
  .string()
  .url()
  .refine(isPublicVercelBlobUrl, {
    message: "Photo must be hosted on Vercel Blob (public store).",
  });

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
    photoUrls: z.array(publicVercelBlobUrlSchema).max(5).optional(),
  })
  .strict();

export type ServiceQuoteRequestInput = z.infer<typeof serviceQuoteRequestSchema>;
