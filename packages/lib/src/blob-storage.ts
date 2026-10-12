import type { PutCommandOptions } from "@vercel/blob";

/**
 * Public assets (invoice PDFs, catalog images) must use the public Blob store token.
 * `BLOB_READ_WRITE_TOKEN` alone often points at a private store — public `access` then fails.
 */
export function publicBlobPutOptions(
  overrides: Omit<PutCommandOptions, "access" | "token"> = {},
): PutCommandOptions {
  const token =
    process.env.BLOB_PUBLIC_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Missing BLOB_PUBLIC_READ_WRITE_TOKEN (public store) for public Blob uploads.",
    );
  }
  return { access: "public", token, ...overrides };
}

export function blobGetOptions(blobUrl: string): { access: "public" | "private"; token: string } {
  const isPrivate = blobUrl.includes(".private.blob.");
  const access = isPrivate ? "private" : "public";
  const token = isPrivate
    ? process.env.BLOB_READ_WRITE_TOKEN?.trim()
    : process.env.BLOB_PUBLIC_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error(
      isPrivate
        ? "Missing BLOB_READ_WRITE_TOKEN for private Blob reads."
        : "Missing BLOB_PUBLIC_READ_WRITE_TOKEN for public Blob reads.",
    );
  }
  return { access, token };
}
