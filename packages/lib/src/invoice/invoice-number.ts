/**
 * Indian FY label (Apr–Mar), UTC date. E.g. Apr 2026 → "2026-27", Jan 2027 → "2026-27".
 */
export function indianFyKeyUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  if (m >= 3) {
    return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
  }
  return `${y - 1}-${String(y % 100).padStart(2, "0")}`;
}

export function formatInvoiceNumber(fyKey: string, seq: number): string {
  return `CRX/${fyKey}/${String(seq).padStart(4, "0")}`;
}
