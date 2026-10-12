import { z } from "zod";
import { isPublicVercelBlobUrl } from "./service-quote.js";

export { isPublicVercelBlobUrl } from "./service-quote.js";

export const publicVercelBlobUrlSchema = z
  .string()
  .url()
  .refine(isPublicVercelBlobUrl, {
    message: "Photo must be hosted on Vercel Blob (public store).",
  });
