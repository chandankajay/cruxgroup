"use server";

import { put } from "@vercel/blob";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Upload a public image to Vercel Blob.
 * Used for catalog type images and fleet machine photos — NOT for KYC/private docs.
 */
export async function uploadPublicImage(
  pathname: string,
  file: File
): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }

  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const token =
    process.env.BLOB_PUBLIC_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.error("[blob-upload] BLOB_PUBLIC_READ_WRITE_TOKEN / BLOB_READ_WRITE_TOKEN is missing.");
    return {
      ok: false,
      error:
        "File storage is not configured. Add BLOB_PUBLIC_READ_WRITE_TOKEN (public store) to the server environment.",
    };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const fullPath = `${pathname}/${Date.now()}-${safeName}`;

  try {
    const blob = await put(fullPath, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });
    return { ok: true, url: blob.url };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[blob-upload] put() failed", { pathname: fullPath, message });
    const hint =
      process.env.NODE_ENV === "development" && message ? ` (${message})` : "";
    return {
      ok: false,
      error: `Upload failed.${hint} Check the terminal for "[blob-upload]" logs.`,
    };
  }
}
