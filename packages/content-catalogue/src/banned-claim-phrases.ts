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

/** Telugu equivalents / related wording (brief §5). */
export const BANNED_TE_PHRASES = [
  "ఆర్కిటెక్ట్",
  "డిజైన్ బృందం",
  "మీతో సిద్ధం",
  "ధృవీకరించిన ఆపరేటర్",
  "GST ఇన్వాయిస్",
  "బోర్వెల్",
  "సంవత్సరాల అనుభవం",
  "సంవత్సరాల వ్యాపారం",
  "HMDA",
  "DTCP",
  "అనుమతి",
  "ఆమోదం",
] as const;

const TELUGU_ZW_JOINER_REGEX = /[\u200C\u200D]/g;

/** Strip ZWNJ/ZWJ so evasion via zero-width characters still matches denylist scans. */
export function normalizeTeluguForBannedPhraseScan(text: string): string {
  return text.replace(TELUGU_ZW_JOINER_REGEX, "");
}

export function teTextContainsBannedPhrase(text: string): boolean {
  const normalized = normalizeTeluguForBannedPhraseScan(text).toLowerCase();
  return BANNED_TE_PHRASES.some((phrase) => normalized.includes(phrase.toLowerCase()));
}

export function collectLocalizedFieldStrings(
  value: unknown,
  field: "en" | "te",
): string[] {
  const results: string[] = [];
  const visit = (node: unknown): void => {
    if (node === null || typeof node !== "object") {
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.en === "string" && typeof record.te === "string") {
      const text = record[field];
      if (typeof text === "string") {
        results.push(text);
      }
      return;
    }
    for (const child of Object.values(record)) {
      visit(child);
    }
  };
  visit(value);
  return results;
}

export function collectLocalizedEnStrings(value: unknown): string[] {
  return collectLocalizedFieldStrings(value, "en");
}

export function collectLocalizedTeStrings(value: unknown): string[] {
  return collectLocalizedFieldStrings(value, "te");
}
