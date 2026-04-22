/**
 * Vercel Blob public URLs can be used directly. Private-store blobs must be loaded
 * through our authenticated proxy (`/api/kyc/blob`).
 */
export function viewerUrlForStoredKycBlob(storedUrl: string | null): string | null {
  if (!storedUrl) return null;
  if (storedUrl.includes(".public.blob.vercel-storage.com")) return storedUrl;
  return `/api/kyc/blob?url=${encodeURIComponent(storedUrl)}`;
}
