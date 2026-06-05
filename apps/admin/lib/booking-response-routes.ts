/**
 * Edge-safe helpers for public booking-response magic links.
 * Token in the URL is the credential — no session required.
 */

/** Matches /requests/{cuid} e.g. /requests/cmq0mvyzy0003v5jkqx7ih5my */
export function isBookingResponseMagicLink(pathname: string): boolean {
  return /^\/requests\/[a-z0-9]+$/i.test(pathname);
}

export function isBookingResponseApi(pathname: string): boolean {
  return (
    pathname === "/api/booking-response" ||
    pathname.startsWith("/api/booking-response/")
  );
}

/** Prevent open-redirect; only same-origin relative paths. */
export function safeCallbackPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}
