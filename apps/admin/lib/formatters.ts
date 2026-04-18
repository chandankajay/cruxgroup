export function normalizePan(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  return s.replace(/\s/g, "").toUpperCase();
}

export function normalizeAadhaar(raw: string | null | undefined): string | null {
  const digits = raw?.replace(/\D/g, "") ?? "";
  return digits.length > 0 ? digits : null;
}

export function normalizeGst(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  return s.replace(/\s/g, "").toUpperCase();
}
