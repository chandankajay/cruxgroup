import { isProductionAppEnv } from "./app-env";

function normalizeAllowlistEntry(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function parseAllowlist(): Set<string> {
  const raw = process.env["AISENSY_TEST_ALLOWLIST"]?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map(normalizeAllowlistEntry),
  );
}

/**
 * Outside production, WhatsApp may only be sent to numbers on AISENSY_TEST_ALLOWLIST.
 */
export function isAisensyDestinationAllowed(
  normalizedDestination: string,
): boolean {
  if (isProductionAppEnv()) return true;
  const digits = normalizedDestination.replace(/\D/g, "");
  const key =
    digits.length === 10 ? `91${digits}` : digits.replace(/^\+/, "");
  const allowlist = parseAllowlist();
  if (allowlist.size === 0) return false;
  return allowlist.has(key);
}
