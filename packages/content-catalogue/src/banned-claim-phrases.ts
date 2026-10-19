/** English substrings that must not appear in published catalogue copy (brief §5). */
export const BANNED_EN_PHRASES = [
  "architect",
  "design team",
  "prepare with you",
  "verified operator",
  "GST invoice",
  "borewell",
  "years of experience",
  "years in business",
  "HMDA",
  "DTCP",
  "permit",
  "approval",
] as const;

export function collectLocalizedEnStrings(value: unknown): string[] {
  const results: string[] = [];
  const visit = (node: unknown): void => {
    if (node === null || typeof node !== "object") {
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.en === "string" && typeof record.te === "string") {
      results.push(record.en);
      return;
    }
    for (const child of Object.values(record)) {
      visit(child);
    }
  };
  visit(value);
  return results;
}
