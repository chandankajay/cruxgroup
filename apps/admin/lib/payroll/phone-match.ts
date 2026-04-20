export function last10Digits(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\D/g, "").slice(-10);
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const da = last10Digits(a);
  const db = last10Digits(b);
  return da.length === 10 && db.length === 10 && da === db;
}
