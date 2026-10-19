/**
 * CWA-29 quality gate for ServiceAreaPage publishing.
 * Extend this module when CWA-29 adds copy/FAQ checks; do not bypass from the seed script.
 */

/** AC4 (CWA-54): only these pairs may be published in the first release. */
export const FIRST_RELEASE_SERVICE_SLUG = "farmhouse-construction";

export const FIRST_RELEASE_AREA_SLUGS: readonly string[] = [
  "fatimapur-kothur",
  "shadnagar",
  "shamshabad",
] as const;

const FIRST_RELEASE_AREA_SET = new Set<string>(FIRST_RELEASE_AREA_SLUGS);

export function isFirstReleaseServiceAreaPair(
  serviceSlug: string,
  areaSlug: string,
): boolean {
  return (
    serviceSlug === FIRST_RELEASE_SERVICE_SLUG &&
    FIRST_RELEASE_AREA_SET.has(areaSlug)
  );
}

export type ServiceAreaPageGateInput = {
  readonly serviceSlug: string;
  readonly areaSlug: string;
  readonly lastReviewed: Date | null;
  readonly thinContent: boolean;
};

export function passesCwa29ServiceAreaQualityGate(
  page: Pick<ServiceAreaPageGateInput, "lastReviewed" | "thinContent">,
): boolean {
  if (page.lastReviewed == null) return false;
  if (page.thinContent) return false;
  return true;
}

/**
 * Publishing via admin CMS sets `lastReviewed` to now — that counts as the content review
 * timestamp for the CWA-29 gate (full copy/FAQ checks land in CWA-29).
 */
export function serviceAreaPageIsPublic(
  page: ServiceAreaPageGateInput & { readonly published: boolean },
): boolean {
  if (!page.published) return false;
  if (!isFirstReleaseServiceAreaPair(page.serviceSlug, page.areaSlug)) {
    return false;
  }
  return passesCwa29ServiceAreaQualityGate(page);
}
