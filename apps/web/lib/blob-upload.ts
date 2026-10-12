"use server";

import { put } from "@vercel/blob";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Public site photos (quote form, etc.) — not for private documents. */
export async function uploadPublicSiteImage(
  pathname: string,
  file: File,
): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Each image must be 10 MB or smaller." };
  }

  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { ok: false, error: "Only JPG, PNG, or WebP images are allowed." };
  }

  const token =
    process.env.BLOB_PUBLIC_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return { ok: false, error: "File upload is temporarily unavailable." };
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
  } catch {
    return { ok: false, error: "Upload failed. Try again or skip photos." };
  }
}
