export type Locale = "en" | "te";

export function parseLocale(raw: string): Locale {
  return raw === "te" ? "te" : "en";
}
