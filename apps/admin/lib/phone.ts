/** Same rule as bookings — valid international-style numbers after `+`. */
export const ADMIN_PHONE_E164 = /^\+[1-9]\d{9,14}$/;

/** Canonical +E.164-style phone for Prisma lookups (matches bookings / API). */
export function normalizeAdminPhone(raw: string): string {
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* ignore */
  }
  s = s.replace(/\s/g, "");
  const digits = s.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (s.startsWith("+") && digits.length >= 10) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return s;
}
