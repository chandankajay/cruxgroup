import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PARTNER_TERMS_VERSION = "1.0";

const legalDir = join(dirname(fileURLToPath(import.meta.url)), "../../legal");

/** Markdown source for Partner OS legal gate (`packages/lib/legal/partner-terms.md`). */
export async function readPartnerTermsMarkdown(): Promise<string> {
  return readFile(join(legalDir, "partner-terms.md"), "utf8");
}
