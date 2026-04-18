/**
 * Canonical phone for DB + auth (matches `authRouter` phone normalization).
 *
 * Handles:
 * - `+919182054293` and `%2B919182054293` (URL-decoded +)
 * - Form quirks where `+` became a space in `x-www-form-urlencoded`
 * - 10-digit local numbers → `+91…`
 */
export function normalizeBookingsPhone(raw: string): string {
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* ignore malformed % sequences */
  }
  s = s.replace(/\s/g, "");
  const digits = s.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (s.startsWith("+") && digits.length >= 10) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return s;
}
